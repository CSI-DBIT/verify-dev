// import libraries
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const shortid = require("shortid");
const { v4: uuidv4 } = require("uuid");
const xlsx = require("xlsx");
require("dotenv").config();

// importing files
const db = require("./db");
const MemberDetail = require("./models/memberSchema");
const CertificateDetail = require("./models/certificateSchema");

const app = express();
const PORT = process.env.PORT;

// Multer configuration
const certificateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./certificates");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const memberExcel = multer.memoryStorage();
const memberExcelupload = multer({ storage: memberExcel });

const certificateStorageupload = multer({ storage: certificateStorage });
app
  .use(cors())
  .use(express.json())
  .use("/certificates", express.static(path.join(__dirname, "certificates")))
  .use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error❌" });
  })

  // api routes
  .get("/", (req, res) => {
    res.send("hello server");
  })

  .post(
    "/api/bulk-upload/certificates",
    certificateStorageupload.array("certificate_files"),
    async (req, res) => {
      try {
        const files = req.files;
        const certificateBody = req.body;

        // Iterate through each uploaded file
        for (const file of files) {
          // Check if a file with the same name already exists in the destination directory
          const existingFile = await CertificateDetail.findOne({
            serverPath: path.join("certificates", file.filename),
          });

          if (existingFile) {
            // Handle duplicate file error
            return res.status(400).json({
              message: "File with the same name already exists.",
            });
          }

          // Your existing code for generating short ID and extracting details from the file name
          shortid.characters(
            "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ#$"
          );

          const generateShortIdForUuid = () => {
            const uuid = uuidv4(file.filename);
            const shortId = shortid.generate(uuid);
            return shortId;
          };

          const shortIdForUuid = generateShortIdForUuid();
          const [studentId, originalCertificateName] =
            file.originalname.split("_");

          const certificate = new CertificateDetail({
            uniqueId: shortIdForUuid,
            studentId: parseInt(studentId, 10),
            serverPath: path.join("certificates", file.filename),
            certificate_name:
              studentId +
              "_" +
              path.parse(originalCertificateName).name.toLowerCase(),
            dateOfIssuing: Date(certificateBody.dateOfIssuing),
          });

          console.log(certificate);
          await certificate.save();
        }
        res
          .status(200)
          .json({ message: "Certificates uploaded successfully👍" });
      } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  )

  .get("/api/get/all-certificate", async (req, res) => {
    try {
      const documents = await CertificateDetail.find({});
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "An error occurred while fetching data." });
    }
  })

  .get("/api/get/all-certificate/:studentId", async (req, res) => {
    try {
      const documents = await CertificateDetail.find({
        studentId: req.params.studentId,
      });
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "An error occurred while fetching data." });
    }
  })
  .post(
    "/api/bulk-upload/member-details",
    memberExcelupload.single("bulk_upload_memberDetails_excel"),
    async (req, res) => {
      try {
        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        let data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Validate data before insertion
        if (!Array.isArray(data) || data.length === 0) {
          return res
            .status(400)
            .json({ error: "Invalid data format or empty data array" });
        }

        // Check if fields in the Excel file match the schema (excluding dateOfCreation)
        const memberSchemaPaths = Object.keys(MemberDetail.schema.paths).filter(
          (path) =>
            path !== "__v" && path !== "_id" && path !== "dateOfCreation"
        );
        for (const item of data) {
          const itemKeys = Object.keys(item);

          const unknownFields = itemKeys.filter(
            (key) => !memberSchemaPaths.includes(key)
          );
          if (unknownFields.length > 0) {
            return res.status(400).json({
              error: `Unknown fields in Excel data: ${unknownFields.join(
                ", "
              )}`,
            });
          }

          const missingFields = memberSchemaPaths.filter(
            (path) => !itemKeys.includes(path)
          );
          if (missingFields.length > 0) {
            return res.status(400).json({
              error: `Missing fields in Excel data: ${missingFields.join(
                ", "
              )}`,
            });
          }
        }
        // Convert startDate and dateOfCreation to Date objects
        data = data.map((item) => {
          if (item.startDate && !isNaN(Date.parse(item.startDate))) {
            item.startDate = new Date(item.startDate);
          }
          if (item.dateOfCreation && !isNaN(Date.parse(item.dateOfCreation))) {
            item.dateOfCreation = new Date(item.dateOfCreation);
          } else {
            // Set dateOfCreation to today's date if it's not present in the Excel sheet
            item.dateOfCreation = new Date(item.startDate);
          }
          return item;
        });
        console.log(data);
        // Validate each item in the array against the MemberDetail schema
        for (const item of data) {
          try {
            await MemberDetail.validate(item);
          } catch (validationError) {
            return res.status(400).json({ error: validationError.message });
          }
        }
        // If validation passes, insert data into the database
        await MemberDetail.insertMany(data, { ordered: true });
        res.status(200).json({ message: "Data uploaded successfully" });
      } catch (error) {
        console.error(error);
        if (error.code === 11000) {
          // Duplicate key error (e.g., unique index violation)
          return res.status(400).json({
            error:
              "Duplicate fields error. Ensure unique constraints are not violated.",
          });
        } else {
          res.status(500).json({ error: "Internal server error" });
        }
      }
    }
  )
  .get("/api/get/member-details", async (req, res) => {
    try {
      const documents = await MemberDetail.find({isDeleted:false});
      res.json(documents);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
  .post("/api/get/member-details/:studentId", async (req, res) => {
    try {
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
  .post("/api/add/member-details", async (req, res) => {
    try {
      const { name, email, studentId, branch, duration, startDate } = req.body;
      console.log(name, email, studentId, branch, duration, startDate);
      // Validate required fields
      if (!name || !email || !studentId || !branch || !duration || !startDate) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Check for invalid numeric values
      if (
        isNaN(Number(studentId)) ||
        isNaN(Number(branch)) ||
        isNaN(Number(duration))
      ) {
        return res.status(400).json({ error: "Invalid numeric values" });
      }

      // Create a new MemberDetail instance
      const newMember = new MemberDetail({
        name: String(name),
        email: String(email),
        studentId: Number(studentId),
        branch: Number(branch),
        duration: Number(duration),
        startDate: Date(startDate),
        dateOfCreation: Date(startDate),
        isDeleted: Boolean(false),
      });
      // Save the new member to the database
      await newMember.save();
      console.log(newMember);

      // Send a success response
      res.status(200).json({ message: "Member added successfully" });
    } catch (error) {
      console.error(error);
      if (error.code === 11000) {
        // Duplicate key error (e.g., unique index violation)
        return res.status(400).json({
          error:
            "Duplicate fields error. Ensure unique constraints are not violated.",
        });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  })

  .put("/api/update/member/:studentId", async (req, res) => {
    try {
      const studentId = req.params.studentId;
      await MemberDetail.findByIdAndUpdate(studentId, req.body);

      res.status(200).json({ message: "Member updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

// Connect to the MongoDB database using the `db` object
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to the database");
  // Start the server after successfully connecting to the database
  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });
});

// Graceful shutdown
process.on("SIGINT", () => {
  db.close(() => {
    console.log("MongoDB connection closed through app termination");
    process.exit(0);
  });
});

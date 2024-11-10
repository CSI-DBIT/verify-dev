import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
const OrgEvents = () => {
  return (
    <main>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
            <Link to={"/dashboard"}>
                <BreadcrumbLink asChild>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbLink>
              </Link>
              <BreadcrumbSeparator className="hidden md:block" />
              <Link to={"/dashboard/events"}>
                <BreadcrumbLink asChild>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Events</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbLink>
              </Link>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>My Events</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <section>org events</section>
    </main>
  );
};

export default OrgEvents;

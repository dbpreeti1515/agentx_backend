import { useEffect, useMemo, useState } from "react";

function getPathname() {
  return window.location.pathname || "/";
}

function parseRoute(pathname) {
  if (/^\/dashboard\/meeting\/[^/]+$/.test(pathname)) {
    return {
      view: "sales-meeting",
      meetingId: pathname.split("/").pop(),
    };
  }

  if (/^\/meet\/[^/]+$/.test(pathname)) {
    return {
      view: "client-meeting",
      meetingId: pathname.split("/").pop(),
    };
  }

  if (pathname === "/login") {
    return {
      view: "login",
      meetingId: "",
    };
  }

  if (pathname === "/dashboard") {
    return {
      view: "dashboard",
      meetingId: "",
    };
  }

  return {
    view: "landing",
    meetingId: "",
  };
}

export function useAppRoute() {
  const [pathname, setPathname] = useState(getPathname());

  useEffect(() => {
    function handleLocationChange() {
      setPathname(getPathname());
    }

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const route = useMemo(() => parseRoute(pathname), [pathname]);

  function navigate(nextPath) {
    if (nextPath !== window.location.pathname) {
      window.history.pushState({}, "", nextPath);
      setPathname(nextPath);
    }
  }

  return {
    navigate,
    route,
  };
}

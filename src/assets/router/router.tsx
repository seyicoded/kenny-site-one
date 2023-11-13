import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import FrontPage from "../pages";
import WebConsultation from "../pages/webConsultation";

const router = createBrowserRouter([
  {
    path: "/",
    element: (<FrontPage />),
  },
  {
    path: "/web-consultation",
    element: (
        <div>
            call id not present
        </div>
    ),
  },
  {
    path: "/web-consultation/:callId",
    element: <WebConsultation />,
  },
]);

export default ()=> <RouterProvider router={router} />;
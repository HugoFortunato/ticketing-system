import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { UserProvider } from "./context/UserContext";
import { EventPage } from "./pages/EventPage";
import { HomePage } from "./pages/HomePage";
import { ReservationPage } from "./pages/ReservationPage";
import { SeatsPage } from "./pages/SeatsPage";
import { TicketPage } from "./pages/TicketPage";

export function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/events/:id" element={<EventPage />} />
            <Route path="/sessions/:sessionId/seats" element={<SeatsPage />} />
            <Route path="/reservations/:id" element={<ReservationPage />} />
            <Route path="/tickets/:id" element={<TicketPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </UserProvider>
  );
}

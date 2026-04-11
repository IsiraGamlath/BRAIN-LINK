import React from "react";
import HelpForm from "../components/Peer_Help_Request/HelpForm";
import "./PostRequestPage.css";

// PostRequestPage: Help request submission form only
const PostRequestPage = () => {
  return (
    <section className="help-request-page">
      <div className="help-request-shell">
        <header className="help-request-hero">
          <p className="help-request-kicker">Peer Help Workspace</p>
          <h1>Create a Help Request</h1>
          <p>Share your academic challenge and get support from peers.</p>
        </header>

        <div className="help-request-form-wrap">
          <div className="help-request-form-pane">
            <HelpForm
              onSuccess={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PostRequestPage;

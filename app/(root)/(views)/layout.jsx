import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/NavBar";
import React from "react";

const layout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <div className="">{children}</div>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default layout;

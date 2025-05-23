import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/NavBar";
import React from "react";

const layout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <div className="container lg:m-10 sm:m-5 sm:p-10 sm:px-10 lg:px-40">
        {children}
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default layout;

import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

export const renderWithAuth = (
  ui
) => {
  return render(
      <BrowserRouter>
        {ui}
      </BrowserRouter>
  );
};

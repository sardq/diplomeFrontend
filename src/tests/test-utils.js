import React from "react";
import { render } from "@testing-library/react";
import { AuthContent } from "../AuthContent";
import { BrowserRouter } from "react-router-dom";

export const renderWithAuth = (
  ui,
  {
    role = "STUDENT",
    email = "test@mail.com",
  } = {}
) => {
  return render(
    <AuthContent.Provider
      value={{ role, email, setRole: jest.fn(), setEmail: jest.fn() }}
    >
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </AuthContent.Provider>
  );
};

/**
 * @jest-environment jsdom
 */
import { fireEvent } from "@testing-library/dom";
import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes";
import Bills, { getBills } from "../containers/Bills.js";
import store from "../__mocks__/store";
import router from "../app/Router.js";

import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

describe("Given I am connected as an employee", () => {
	describe("When I am on NewBill Page", () => {
		beforeEach(() => {
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			Object.defineProperty(window, "localStorage", {
				value: localStorageMock,
			});
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
			const html = NewBillUI();
			document.body.innerHTML = html;
			const newBill = new NewBill({
				document,
				onNavigate,
				store: null,
				bills,
				localStorage: window.localStorage,
			});
		});
		test("Then the right page is displayed", () => {
			expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
		});
		test("All the input elements are diplayed", () => {
			expect(screen.getByTestId("expense-type")).toBeTruthy();
			expect(screen.getByPlaceholderText("Vol Paris Londres")).toBeTruthy();
			expect(screen.getByTestId("expense-type")).toBeTruthy();
			expect(screen.getByTestId("datepicker")).toBeTruthy();
			expect(screen.getByTestId("amount")).toBeTruthy();
			expect(screen.getByTestId("vat")).toBeTruthy();
			expect(screen.getByTestId("pct")).toBeTruthy();
			expect(screen.getByTestId("commentary")).toBeTruthy();
			expect(screen.getByTestId("file")).toBeTruthy();
		});
		afterEach(() => {
			document.body.innerHTML = "";
		});
	});
});

describe("Given I am connected as an employee and I am on NewBill Page", () => {
	describe("When I click the button to add document", () => {
		test("Then the handleChangeFile method is called", () => {
			const html = NewBillUI();
			document.body.innerHTML = html;
			Object.defineProperty(window, "localStorage", {
				value: localStorageMock,
			});
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
					email: "employee@test.tld",
					password: "employee",
					status: "connected",
				})
			);
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const newBill = new NewBill({
				document,
				onNavigate,
				store: store,
				localStorage: window.localStorage,
			});
			const handleChangeFile = jest.fn(newBill.handleChangeFile);
			const fileTrue = "test.png";
			let input = screen.getByTestId("file");
			input.addEventListener("input", handleChangeFile);
			fireEvent.input(input, fileTrue);
			expect(handleChangeFile).toHaveBeenCalled();
		});
		afterEach(() => {
			document.body.innerHTML = "";
		});
	});
});



describe("Given I am connected as an employee and I am on NewBill Page", () => {
  describe("When I click the submit button", () => {
    beforeEach(() => {});
    test("The click event is listened   ", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "employee@test.tld",
          password: "employee",
          status: "connected",
        })
      );
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });
      const submitMethod = jest.spyOn(newBill, "handleSubmit");
      const submitElement = screen.getByTestId("form-new-bill");
      submitElement.addEventListener("submit", submitMethod);
      fireEvent.submit(submitElement);
      expect(submitMethod).toHaveBeenCalled();
      jest.restoreAllMocks();
    });

    afterEach(() => {
      document.body.innerHTML = "";
    });
  });
});

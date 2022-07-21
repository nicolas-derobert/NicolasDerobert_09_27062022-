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
import Bills from "../containers/Bills.js";
import store from "../__mocks__/store";
import router from "../app/Router.js";
import mockStore from "../__mocks__/store";
jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
	describe("When I am on Bills Page", () => {
		test("Then bill icon in vertical layout should be highlighted", async () => {
			Object.defineProperty(window, "localStorage", {
				value: localStorageMock,
			});
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
			const root = document.createElement("div");
			root.setAttribute("id", "root");
			document.body.append(root);
			router();
			window.onNavigate(ROUTES_PATH.Bills);
			await waitFor(() => screen.getByTestId("icon-window"));
			const windowIcon = screen.getByTestId("icon-window");
			expect(windowIcon.classList.contains("active-icon")).toBe(true);
		});

		test("The bills were get", async () => {
			localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
					email: "employee@test.tld",
					password: "employee",
					status: "connected",
				})
			);
			const root = document.createElement("div");
			root.setAttribute("id", "root");
			document.body.append(root);
			router();
			window.onNavigate(ROUTES_PATH.Bills);
			const divIcon1 = document.getElementById("layout-icon1");
			const divIcon2 = document.getElementById("layout-icon2");
			divIcon1.classList.add("active-icon");
			divIcon2.classList.remove("active-icon");
			const bills = new Bills({ document, onNavigate, store, localStorage });
			const getSpyBills = jest.spyOn(bills, "getBills");
			bills.getBills();
			expect(getSpyBills).toHaveBeenCalled();
		});

		test("Then the bill page title should be displayed", () => {
			const html = BillsUI({ data: bills });
			document.body.innerHTML = html;
			expect(screen.getByText("Mes notes de frais")).toBeTruthy();
		});
		test("Then error page render", () => {
			const html = BillsUI({
				data: null,
				loading: null,
				error: "errormessage",
			});
			document.body.innerHTML = html;
			expect(html).toContain("errormessage");
		});
	});
});
describe("Given I am connected as employee, and bill page is displayed", () => {
	describe("When I click on the icon eye", () => {
		test("Then ClickIconEye method should be fired", () => {
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const store = null;
			const html = BillsUI({ data: bills });
			document.body.innerHTML = html;
			let myBills = new Bills({ document, onNavigate, store, localStorage });
			const eyes = screen.getAllByTestId("icon-eye");
			$.fn.modal = jest.fn();
			const handleClickIconEyeSpyMethode = jest.spyOn(
				myBills,
				"handleClickIconEye"
			);
			eyes[0].addEventListener("click", handleClickIconEyeSpyMethode(eyes[0]));
			fireEvent.click(eyes[0]);
			expect(handleClickIconEyeSpyMethode).toHaveBeenCalled();
			jest.restoreAllMocks();
		});
	});
	describe("When I click on the button 'New bill'", () => {
		test("Then NewBill method should be fired", () => {
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const store = null;
			const html = BillsUI({ data: bills });
			document.body.innerHTML = html;
			let input = screen.getByTestId("btn-new-bill");
			let myBills = new Bills({ document, onNavigate, store, localStorage });
			const handleClickNewBillSpyMethode = jest.spyOn(
				myBills,
				"handleClickNewBill"
			);
			input.addEventListener("click", handleClickNewBillSpyMethode);
			fireEvent.click(input);
			expect(handleClickNewBillSpyMethode).toHaveBeenCalled();
			jest.restoreAllMocks();
		});
	});
});
describe("Given I am a user connected as Admin", () => {
	describe("When I navigate to Dashboard", () => {
		describe("When an error occurs on API", () => {
			beforeEach(() => {
				jest.spyOn(mockStore, "bills");
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
				const root = document.createElement("div");
				root.setAttribute("id", "root");
				document.body.appendChild(root);
				router();
			});
			test("fetches bills from an API and fails with 404 message error", async () => {
				mockStore.bills.mockImplementationOnce(() => {
					return {
						list: () => {
							return Promise.reject(new Error("Erreur 404"));
						},
					};
				});
				window.onNavigate(ROUTES_PATH.Bills);
				await new Promise(process.nextTick);
				const message = await screen.getByText(/Erreur 404/);
				expect(message).toBeTruthy();
			});

			test("fetches messages from an API and fails with 500 message error", async () => {
				mockStore.bills.mockImplementationOnce(() => {
					return {
						list: () => {
							return Promise.reject(new Error("Erreur 500"));
						},
					};
				});

				window.onNavigate(ROUTES_PATH.Bills);
				await new Promise(process.nextTick);
				const message = await screen.getByText(/Erreur 500/);
				expect(message).toBeTruthy();
			});
		});
	});
});

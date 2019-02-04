import { createController, IDatasetController } from './../dataset.controller';
import * as mockReq from 'mock-express-request';
import * as mockRes from 'mock-express-response';
import { IDatasetPort } from '../../../../app/ports';
// tslint:disable
describe('Dataset controller', () => {
	let controller: IDatasetController;
	let mockDatasetService: IDatasetPort;
	beforeEach(() => {
		mockDatasetService = {
			sendDatasetFile: jest.fn()
		};
		controller = createController(mockDatasetService);
	});
	it('should be return a promise', () => {
		const req = new mockReq({
			body: {
				email: 'test'
			}
		});
		const res = new mockRes();
		const result = controller.submitDataset(req, res);
		expect(result).toBeInstanceOf(Promise);
	});
	it('should be return a 500 response', () => {
		mockDatasetService.sendDatasetFile = jest.fn(() => {
			throw new Error();
		});
		const req = new mockReq({
			body: {
				firstName: 'test'
			}
		});
		req.file = true;
		const res = new mockRes();
		expect.assertions(1);
		return controller
			.submitDataset(req, res)
			.then(success => expect(res.statusCode).toBe(500));
	});
	it('should be return a 200 response', () => {
		const req = new mockReq({
			body: {
				firstName: 'test'
			}
		});
		req.file = true;
		const res = new mockRes();
		expect.assertions(1);
		return controller
			.submitDataset(req, res)
			.then(success => expect(res.statusCode).toBe(200));
	});
	it('should be return a 400 response', () => {
		const req = new mockReq();
		const res = new mockRes();
		expect.assertions(1);
		return controller
			.submitDataset(req, res)
			.then(success => expect(res.statusCode).toBe(400));
	});
});

const createValidator = () => ({
	validateSample: jest.fn()
});

const ConstraintSet = {
	STANDARD: 'standard',
	ZOMO: 'ZoMo'
};

export { createValidator, ConstraintSet };

import TestTools from './test-tools';
describe('layout with empty stack', function () {
    let layout;
    beforeEach(function () {
        const rootLayout = {
            root: {
                type: 'row',
                content: [
                    {
                        type: 'component',
                        componentType: TestTools.TEST_COMPONENT_NAME,
                        componentState: { text: 'Component 1' }
                    }, {
                        type: 'component',
                        componentType: TestTools.TEST_COMPONENT_NAME,
                        componentState: { text: 'Component 2' }
                    }, {
                        type: 'stack',
                        isClosable: false,
                        content: []
                    }
                ]
            }
        };
        layout = TestTools.createLayout(rootLayout);
    });
    afterEach(function () {
        layout === null || layout === void 0 ? void 0 : layout.destroy();
    });
    it('can be manipulated', function () {
        const row = layout.rootItem;
        expect(row === null || row === void 0 ? void 0 : row.isRow).toBe(true);
        layout.addItemAtLocation({
            type: 'component',
            componentType: TestTools.TEST_COMPONENT_NAME
        }, [{ typeId: 4 /* FirstRow */, index: 3 }]);
        TestTools.verifyPath('3.stack.0.component', layout);
    });
    it('can have child added to the empty stack', function () {
        var _a;
        const stack = (_a = layout.rootItem) === null || _a === void 0 ? void 0 : _a.contentItems[2];
        expect(stack === null || stack === void 0 ? void 0 : stack.isStack).toBe(true);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(stack.contentItems.length).toBe(0);
        const addedItem = layout.newItemAtLocation({
            type: 'component',
            componentType: TestTools.TEST_COMPONENT_NAME
        }, [{ typeId: 4 /* FirstRow */, index: 2 }]);
        const itemInOriginallyEmptyStack = TestTools.verifyPath('2.stack.0.component', layout);
        expect(itemInOriginallyEmptyStack).toEqual(addedItem);
    });
});
//# sourceMappingURL=empty-stack-tests.js.map
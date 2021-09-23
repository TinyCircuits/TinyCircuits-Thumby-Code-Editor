import TestTools from './test-tools';
describe('drag source', function () {
    let layout;
    let dragSourceElement;
    const createdFromDragSourceClass = 'createdFromDragSource';
    beforeEach(function () {
        const rootLayout = {
            root: {
                type: 'stack',
                content: [
                    {
                        type: 'component',
                        componentType: TestTools.TEST_COMPONENT_NAME,
                        componentState: { html: '<div id="item-1"></div>' }
                    }
                ]
            }
        };
        layout = TestTools.createLayout(rootLayout);
        expect(layout.isInitialised).toBeTrue();
    });
    afterEach(function () {
        layout.destroy();
    });
    it('creates a new component when dragged (static component config)', function () {
        createDragSource(false);
        doComponentDragTest();
    });
    it('creates a new component if dragged (deferred component config)', function () {
        createDragSource(true);
        doComponentDragTest();
    });
    function createDragSource(deferred) {
        dragSourceElement = document.createElement('div');
        dragSourceElement.id = 'dragSrc';
        document.body.appendChild(dragSourceElement);
        const componentType = TestTools.TEST_COMPONENT_NAME;
        const componentState = { html: `<div class="${createdFromDragSourceClass}"></div>` };
        const componentTitle = 'created from drag source';
        let dragSourceParameters;
        if (deferred) {
            dragSourceParameters = [
                dragSourceElement,
                () => ({
                    type: componentType,
                    state: componentState,
                    title: componentTitle
                })
            ];
        }
        else {
            dragSourceParameters = [dragSourceElement, componentType, componentState, componentTitle];
        }
        layout.newDragSource(...dragSourceParameters);
    }
    function doComponentDragTest() {
        let dragProxy = TestTools.getDragProxy();
        expect(dragProxy).toBeNull();
        startDrag();
        doDrag();
        dragProxy = TestTools.getDragProxy();
        expect(dragProxy).toBeInstanceOf(HTMLDivElement);
        endDrag();
        dragProxy = TestTools.getDragProxy();
        expect(dragProxy).toBeNull();
        const componentItem = TestTools.verifyPath('row.1.stack.0', layout);
        expect(componentItem.element.querySelectorAll(`.${createdFromDragSourceClass}`).length)
            .toBe(1, 'number of .dragged elements inside dropped element');
    }
    function startDrag() {
        const pointerDownEvent = new PointerEvent('pointerdown', {
            bubbles: true,
            clientX: dragSourceElement.clientLeft,
            clientY: dragSourceElement.clientTop,
            isPrimary: true,
        });
        dragSourceElement.dispatchEvent(pointerDownEvent);
    }
    function doDrag() {
        var _a;
        const rootRect = (_a = layout.rootItem) === null || _a === void 0 ? void 0 : _a.element.getBoundingClientRect();
        if (rootRect === undefined) {
            throw new Error('no root rectangle!');
        }
        // choose a point on the far right side
        const pointerMoveX = rootRect.left + rootRect.width * 0.9;
        const pointerMoveY = rootRect.top + rootRect.height * 0.5;
        const pointerMoveEvent = new PointerEvent('pointermove', {
            bubbles: true,
            clientX: pointerMoveX,
            clientY: pointerMoveY
        });
        dragSourceElement.dispatchEvent(pointerMoveEvent);
    }
    function endDrag() {
        const pointerUpEvent = new PointerEvent('pointerup', { bubbles: true });
        dragSourceElement.dispatchEvent(pointerUpEvent);
    }
});
//# sourceMappingURL=drag-tests.js.map
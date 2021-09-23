import { GoldenLayout } from '../..';
export default class TestTools {
    static createLayout(config) {
        const myLayout = new GoldenLayout();
        myLayout.registerComponentFactoryFunction(this.TEST_COMPONENT_NAME, TestTools.createTestComponent);
        myLayout.loadLayout(config);
        expect(myLayout.isInitialised).toBeTrue();
        return myLayout;
    }
    static createTestComponent(container, state) {
        if (state === undefined) {
            const span = document.createElement('span');
            span.innerText = 'that worked';
            container.element.appendChild;
        }
        else if (state) {
            const html = state.html;
            if (html) {
                container.element.outerHTML = html;
            }
        }
        return undefined;
    }
    /**
     * Takes a path of type.index.type.index, and returns the corresponding resolved item config
     *
     * @example
     * verifyPath('row.0.stack.1.component', layout)
     * // returns object of type ComponentItemConfig
     */
    static verifyPath(path, layout) {
        let rootItem = layout.rootItem;
        expect(rootItem).toBeTruthy();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        rootItem = rootItem;
        const pathSegments = path.split('.');
        let node = rootItem;
        for (let i = 0; i < pathSegments.length; i++) {
            const pathSegment = pathSegments[i];
            const pathSegmentAsInt = parseInt(pathSegment, 10);
            if (isNaN(pathSegmentAsInt)) {
                expect(node.type).toBe(pathSegment);
            }
            else {
                expect(node.isStack || node.isRow || node.isColumn).toBeTrue();
                node = node.contentItems[pathSegmentAsInt];
                expect(node).toBeDefined();
            }
        }
        return node;
    }
    static getDragProxy() {
        // class copied from DomConstants.ClassName.DragProxy (could instead expose this in public API?)
        const dragProxy = document.querySelector('.lm_dragProxy');
        return dragProxy;
    }
}
TestTools.TEST_COMPONENT_NAME = 'testComponent';
//# sourceMappingURL=test-tools.js.map
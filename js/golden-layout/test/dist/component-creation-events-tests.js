import { GoldenLayout } from '../..';
describe('component creation', function () {
    let layout;
    const eventListener = globalThis.jasmine.createSpyObj(['itemCreated']);
    beforeAll(function () {
        layout = new GoldenLayout();
        function Recorder(container) {
            const span = document.createElement('span');
            span.innerText = 'that worked';
            container.element.appendChild(span);
            return;
        }
        layout.registerComponentFactoryFunction('testComponent', Recorder);
        layout.addEventListener('itemCreated', eventListener.itemCreated);
    });
    afterAll(function () {
        layout.destroy();
    });
    it('results in an event emitted for each component in the layout', function () {
        expect(eventListener.itemCreated).not.toHaveBeenCalled();
        const config = {
            root: {
                type: 'column',
                content: [
                    {
                        type: 'stack',
                        content: [
                            {
                                type: 'component',
                                componentType: 'testComponent'
                            }
                        ]
                    }
                ]
            }
        };
        layout.loadLayout(config);
        expect(eventListener.itemCreated.calls.count()).toBe(3);
    });
});
//# sourceMappingURL=component-creation-events-tests.js.map
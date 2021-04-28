import { Selector } from '../main/Selector';
import { Edge, Loop, Node } from '../main/Types';

describe('selectElement should change element attribute', () => {
    it('for node', async () => {
        let selector = new Selector();
        let node = new Node("", "", 4, 5, true, false);
        selector.selectElement(node);

        expect(node.isSelected).toBe(true);
    });

    it('for edge', async () => {
        let selector = new Selector();
        let edge = new Edge(3, null as any, "", 1, null as any, "", false);
        selector.selectElement(edge);

        expect(edge.isSelected).toBe(true);
    });

    it('for loop', async () => {
        let selector = new Selector();
        let loop = new Loop(new Node("", "", 4, 5, true, false));
        selector.selectElement(loop);

        expect(loop.isSelected).toBe(true);
    });
});

describe('selectElement and deselectElement should not-change element attribute', () => {
    it('for node', async () => {
        let selector = new Selector();
        let node = new Node("", "", 4, 5, true, false);
        selector.selectElement(node);
        selector.deselectElement(node);

        expect(node.isSelected).toBe(false);
    });

    it('for edge', async () => {
        let selector = new Selector();
        let edge = new Edge(3, null as any, "", 1, null as any, "", false);
        selector.selectElement(edge);
        selector.deselectElement(edge);

        expect(edge.isSelected).toBe(false);
    });

    it('for loop', async () => {
        let selector = new Selector();
        let loop = new Loop(new Node("", "", 4, 5, true, false));
        selector.selectElement(loop);
        selector.deselectElement(loop);

        expect(loop.isSelected).toBe(false);
    });
});

describe('element areSelected test', () => {
    describe('nodesAreSelected test', () => {
        it('should are selected after selection', async () => {
            let selector = new Selector();
            let node = new Node("", "", 4, 5, true, false);
            selector.selectElement(node);

            expect(selector.nodesAreSelected()).toBe(true);
        });

        it('should are not selected befor selection', async () => {
            let selector = new Selector();
            expect(selector.nodesAreSelected()).toBe(false);
        });
    });

    describe('edgesAreSelected test', () => {
        it('should are selected after selection', async () => {
            let selector = new Selector();
            let edge = new Edge(3, null as any, "", 1, null as any, "", false);
            selector.selectElement(edge);

            expect(selector.edgesAreSelected()).toBe(true);
        });

        it('should are not selected befor selection', async () => {
            let selector = new Selector();
            expect(selector.edgesAreSelected()).toBe(false);
        });
    });
// 
    describe('loopsAreSelected test', () => {
        it('should are selected after selection', async () => {
            let selector = new Selector();
            let loop = new Loop(new Node("", "", 4, 5, true, false));
            selector.selectElement(loop);

            expect(selector.loopsAreSelected()).toBe(true);
        });

        it('should are not selected befor selection', async () => {
            let selector = new Selector();
            expect(selector.loopsAreSelected()).toBe(false);
        });
    });
});

describe('selectOrUnselectElement', () => {
    describe('should change attribute after one selectOrUnselectElement', () => {
        it('for Node', async () => {
            let selector = new Selector();
            let node = new Node("", "", 4, 5, true, false);
            selector.selectOrUnselectElement(node);

            expect(node.isSelected).toBe(true);
        });

        it('for Edge', async () => {
            let selector = new Selector();
            let edge = new Edge(3, null as any, "", 1, null as any, "", false);
            selector.selectOrUnselectElement(edge);

            expect(edge.isSelected).toBe(true);
        });

        it('for Loop', async () => {
            let selector = new Selector();
            let loop = new Loop(new Node("", "", 4, 5, true, false));
            selector.selectOrUnselectElement(loop);

            expect(loop.isSelected).toBe(true);
        });

    });

    describe('should not change attribute after two selectOrUnselectElement', () => {
        it('for Node', async () => {
            let selector = new Selector();
            let node = new Node("", "", 4, 5, true, false);
            selector.selectOrUnselectElement(node);
            selector.selectOrUnselectElement(node);

            expect(node.isSelected).toBe(false);
        });

        it('for Edge', async () => {
            let selector = new Selector();
            let edge = new Edge(3, null as any, "", 1, null as any, "", false);
            selector.selectOrUnselectElement(edge);
            selector.selectOrUnselectElement(edge);

            expect(edge.isSelected).toBe(false);
        });

        it('for Loop', async () => {
            let selector = new Selector();
            let loop = new Loop(new Node("", "", 4, 5, true, false));
            selector.selectOrUnselectElement(loop);
            selector.selectOrUnselectElement(loop);

            expect(loop.isSelected).toBe(false);
        });

    });

});
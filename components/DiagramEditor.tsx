import React, { useRef, useEffect, useState, MouseEvent, TouchEvent } from 'react';

interface Props {
  initialSvg: string;
  onUpdate: (newSvg: string) => void;
}

export const DiagramEditor: React.FC<Props> = ({ initialSvg, onUpdate }) => {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [selectedElement, setSelectedElement] = useState<SVGElement | null>(null);
  const [offset, setOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

  // Load the initial SVG and make elements interactive
  useEffect(() => {
    if (svgContainerRef.current) {
      svgContainerRef.current.innerHTML = initialSvg;
      // Add cursor styles to draggable elements
      svgContainerRef.current.querySelectorAll('#vehicle-A, #vehicle-B').forEach(elem => {
        // FIX: Cast to SVGElement, not HTMLElement, to access the style property correctly.
        (elem as SVGElement).style.cursor = 'grab';
      });
    }
  }, [initialSvg]);


  const getSVGPoint = (clientX: number, clientY: number) => {
    const svg = svgContainerRef.current?.querySelector('svg');
    if (!svg) return { x: 0, y: 0 };
    
    const screenPoint = svg.createSVGPoint();
    screenPoint.x = clientX;
    screenPoint.y = clientY;
    
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };

    return screenPoint.matrixTransform(ctm.inverse());
  };

  const startDrag = (evt: React.MouseEvent | React.TouchEvent) => {
    const target = (evt.target as SVGElement).closest('#vehicle-A, #vehicle-B');
    if (target && svgContainerRef.current) {
      evt.preventDefault();
      setSelectedElement(target as SVGElement);

      const clientX = 'touches' in evt ? evt.touches[0].clientX : evt.clientX;
      const clientY = 'touches' in evt ? evt.touches[0].clientY : evt.clientY;
      const startPos = getSVGPoint(clientX, clientY);
      
      // FIX: Cast to SVGGraphicsElement to access the 'transform' property.
      const transform = (target as SVGGraphicsElement).transform.baseVal.getItem(0);
      let initialX = 0, initialY = 0;
      if (transform && transform.type === SVGTransform.SVG_TRANSFORM_TRANSLATE) {
        initialX = transform.matrix.e;
        initialY = transform.matrix.f;
      }
      
      setOffset({ x: startPos.x - initialX, y: startPos.y - initialY });

      (target as SVGElement).style.cursor = 'grabbing';
      svgContainerRef.current.style.cursor = 'grabbing';
    }
  };

  const drag = (evt: React.MouseEvent | React.TouchEvent) => {
    if (selectedElement) {
        evt.preventDefault();
        
        const clientX = 'touches' in evt ? evt.touches[0].clientX : evt.clientX;
        const clientY = 'touches' in evt ? evt.touches[0].clientY : evt.clientY;
        const coord = getSVGPoint(clientX, clientY);

        const newX = coord.x - offset.x;
        const newY = coord.y - offset.y;

        // FIX: Cast to SVGGraphicsElement to access the 'transform' property.
        const transform = (selectedElement as SVGGraphicsElement).transform.baseVal;
        if (transform.length === 0 || transform.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
            const svg = selectedElement.ownerSVGElement;
            if(svg) {
                const translate = svg.createSVGTransform();
                translate.setTranslate(newX, newY);
                transform.insertItemBefore(translate, 0);
            }
        } else {
            transform.getItem(0).setTranslate(newX, newY);
        }
    }
  };

  const endDrag = () => {
    if (selectedElement && svgContainerRef.current) {
        // FIX: Remove incorrect cast to HTMLElement. SVGElement has a style property.
        selectedElement.style.cursor = 'grab';
        svgContainerRef.current.style.cursor = 'default';

        // Serialize the SVG to a string to save the changes
        const serializer = new XMLSerializer();
        const svgElement = svgContainerRef.current.querySelector('svg');
        if(svgElement){
           onUpdate(serializer.serializeToString(svgElement));
        }
    }
    setSelectedElement(null);
  };
  
  return (
    <div>
        <div 
            ref={svgContainerRef}
            className="w-full bg-zinc-700/50 border border-zinc-600 rounded-md select-none"
            onMouseDown={startDrag}
            onMouseMove={drag}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
            onTouchStart={startDrag}
            onTouchMove={drag}
            onTouchEnd={endDrag}
        />
        <p className="mt-2 text-xs text-zinc-400 text-center">Click and drag vehicles to adjust the diagram.</p>
    </div>
  );
};
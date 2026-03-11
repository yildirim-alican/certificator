'use client';

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { CertificateTemplate } from '@/types/CertificateTemplate';

interface TemplateSelectorProps {
  templates: CertificateTemplate[];
  activeTemplateId: string | null;
  onSelectTemplate: (template: CertificateTemplate) => void;
  onCreateNew: () => void;
}

/**
 * Template Selector Ribbon
 * 
 * Horizontal scrollable ribbon showing template thumbnails
 * with left/right navigation arrows
 */
const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  activeTemplateId,
  onSelectTemplate,
  onCreateNew,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(templates.length > 4);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 300;
    const newScrollLeft =
      scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });

    setTimeout(checkScroll, 300);
  };

  React.useEffect(() => {
    checkScroll();
    scrollContainerRef.current?.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      scrollContainerRef.current?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [templates.length]);

  return (
    <div className="bg-white border-b border-gray-200 px-3 py-1.5">
      <div className="flex items-center gap-1.5">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className="flex-shrink-0 p-1.5 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition"
          title="Scroll left"
        >
          <ChevronLeft size={16} className="text-gray-500" />
        </button>

        {/* Templates Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-hidden scroll-smooth"
        >
          <div className="flex gap-2 pb-0.5">
            {/* Add New Template Button */}
            <button
              onClick={onCreateNew}
              className="flex-shrink-0 w-16 h-12 rounded-md border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 transition flex flex-col items-center justify-center gap-0.5"
              title="Create new template"
            >
              <Plus size={16} className="text-blue-600" />
              <span className="text-[10px] font-medium text-blue-600">New</span>
            </button>

            {/* Template Cards */}
            {templates.map((template) => {
              const isActive = template.id === activeTemplateId;
              return (
                <button
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  className={`flex-shrink-0 w-20 h-12 rounded-md border-2 transition flex flex-col items-center justify-center gap-0.5 ${
                    isActive
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  title={template.name}
                >
                  <div className={`text-[10px] font-semibold ${isActive ? 'text-blue-700' : 'text-gray-600'}`}>
                    {template.orientation === 'landscape' ? '◄━━►' : '▲'}
                  </div>
                  <p className="text-[10px] text-center line-clamp-1 px-1">{template.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className="flex-shrink-0 p-1.5 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition"
          title="Scroll right"
        >
          <ChevronRight size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Show count */}
      <div className="mt-1 text-[10px] text-gray-400">
        {templates.length > 0
          ? `${templates.length} template${templates.length !== 1 ? 's' : ''}`
          : 'No templates yet'}
      </div>
    </div>
  );
};

export default TemplateSelector;

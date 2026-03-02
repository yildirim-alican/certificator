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
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center gap-2">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className="flex-shrink-0 p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
          title="Scroll left"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>

        {/* Templates Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-hidden scroll-smooth"
        >
          <div className="flex gap-3 pb-1">
            {/* Add New Template Button */}
            <button
              onClick={onCreateNew}
              className="flex-shrink-0 w-24 h-20 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 transition flex flex-col items-center justify-center gap-1"
              title="Create new template"
            >
              <Plus size={20} className="text-blue-600" />
              <span className="text-xs font-medium text-blue-600">New</span>
            </button>

            {/* Template Cards */}
            {templates.map((template) => {
              const isActive = template.id === activeTemplateId;
              return (
                <button
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  className={`flex-shrink-0 w-24 h-20 rounded-lg border-2 transition flex flex-col items-center justify-center gap-1 ${
                    isActive
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  title={template.name}
                >
                  <div className={`text-xs font-semibold ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                    {template.orientation === 'landscape' ? '◄━━►' : '▲'}
                  </div>
                  <p className="text-xs text-center line-clamp-2 px-1">{template.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className="flex-shrink-0 p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
          title="Scroll right"
        >
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Show count */}
      <div className="mt-2 text-xs text-gray-600">
        {templates.length > 0
          ? `Showing ${Math.min(4, templates.length)} of ${templates.length} templates`
          : 'No templates yet'}
      </div>
    </div>
  );
};

export default TemplateSelector;

import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Helper to create heading IDs
const createHeadingId = (text: string, level: number): string => {
  const cleanedText = typeof text === 'string' 
    ? text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    : '';
  return `heading-${level}-${cleanedText}`;
};

// Custom CodeBlock component with enhanced re-render capability
const CodeBlock = ({ language, code, showLineNumbers = true }: { language: string, code: string, showLineNumbers?: boolean }) => {
  const [renderKey, setRenderKey] = useState(0);
  const [hasRendered, setHasRendered] = useState(false);

  // Fungsi untuk memaksa re-render
  const forceRerender = () => {
    setRenderKey(prev => prev + 1);
    setHasRendered(true);
  };

  useEffect(() => {
    // Daftar event listener untuk berbagai kondisi yang memungkinkan
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        forceRerender();
      }
    };

    const handleFocus = () => {
      forceRerender();
    };

    // Set up intersection observer untuk memicu re-render saat elemen terlihat
    let observer: IntersectionObserver;
    const currentRef = document.getElementById(`code-${renderKey}`);
    
    if (currentRef && window.IntersectionObserver) {
      observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          forceRerender();
        }
      }, { threshold: 0.1 });
      
      observer.observe(currentRef);
    }

    // Daftarkan event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      if (observer && currentRef) {
        observer.disconnect();
      }
    };
  }, [hasRendered, renderKey]);

  // Monitor resize events termasuk tab restore
  useEffect(() => {
    const handleResize = () => {
      forceRerender();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div id={`code-${renderKey}`} className="overflow-x-auto w-full">
      <SyntaxHighlighter
        key={renderKey}
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        showLineNumbers={showLineNumbers}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          padding: '1.5rem',
          fontSize: '0.9rem',
          backgroundColor: 'transparent',
          minWidth: '100%',
          width: 'fit-content',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export const MarkdownRenderers = {
  code({node, inline, className, children, ...props}: any) {
    const match = /language-(\w+)/.exec(className || '');
    
    // Only add copy button for code blocks, not inline code
    if (!inline && match) {
      // Clean up the code string for proper display and copying
      // This removes the final newline and trims any extra whitespace
      const codeString = String(children).replace(/\n$/, '').trim();
      
      // Custom component for code block with copy button
      return (
        <div className="my-6 overflow-hidden rounded-lg bg-gray-950 shadow-xl">
          <div className="flex items-center justify-between bg-gray-900 px-4 py-2">
            <span className="text-xs font-semibold text-gray-400">
              {match[1].toUpperCase()}
            </span>
            <CopyButton code={codeString} />
          </div>
          <div className="overflow-x-auto">
            <CodeBlock 
              language={match[1]} 
              code={codeString} 
            />
          </div>
        </div>
      );
    }
    
    // Regular inline code
    return (
      <code className={`${className} bg-gray-800 px-1 py-0.5 rounded text-gray-200`} {...props}>
        {children}
      </code>
    );
  },
  img({src, alt, title, ...props}: any) {
    return (
      <img 
        src={src} 
        alt={alt || ''} 
        title={title || alt || ''} 
        className="rounded-lg max-w-full h-auto mx-auto shadow-lg my-6"
        {...props}
      />
    );
  },
  // Ensure paragraphs containing only images don't have extra margins
  p({children, ...props}: any) {
    const hasOnlyImage = React.Children.toArray(children).every(
      child => typeof child === 'object' && ((child as any)?.type === 'img' || (child as any)?.props?.src)
    );
    
    // If it only contains images, render a div with image-specific styling instead
    if (hasOnlyImage) {
      return (
        <div className="my-8 text-center">
          {children}
          {React.Children.map(children, child => {
            if (typeof child === 'object' && (child as any)?.props?.title) {
              return (
                <p className="text-center text-sm text-gray-400 mt-2">
                  {(child as any).props.title}
                </p>
              );
            }
            return null;
          })}
        </div>
      );
    }
    
    // Regular paragraph
    return <p className="mb-3" {...props}>{children}</p>;
  },
  // Add styling for div elements to handle HTML content better
  div({node, className, children, ...props}: any) {
    return (
      <div className={`my-4 ${className || ''}`} {...props}>
        {children}
      </div>
    );
  },
  // Add custom renderer for horizontal rules (line separators)
  hr: () => (
    <hr className="my-8 border-t border-gray-700" />
  ),
  // Custom heading renderers with IDs
  h1: ({children}: any) => {
    const id = createHeadingId(String(children), 1);
    return (
      <h1 id={id} className="text-3xl sm:text-4xl font-bold mt-10 mb-6 text-white border-b border-gray-800 pb-2">
        {children}
      </h1>
    );
  },
  h2: ({children}: any) => {
    const id = createHeadingId(String(children), 2);
    return (
      <h2 id={id} className="text-2xl sm:text-3xl font-bold mt-8 mb-4 text-white border-b border-gray-800 pb-2">
        {children}
      </h2>
    );
  },
  h3: ({children}: any) => {
    const id = createHeadingId(String(children), 3);
    return (
      <h3 id={id} className="text-xl sm:text-2xl font-semibold mt-6 mb-3 text-white">
        {children}
      </h3>
    );
  },
  h4: ({children}: any) => {
    const id = createHeadingId(String(children), 4);
    return (
      <h4 id={id} className="text-lg sm:text-xl font-medium mt-5 mb-2 text-primary-300">
        {children}
      </h4>
    );
  },
  h5: ({children}: any) => {
    const id = createHeadingId(String(children), 5);
    return (
      <h5 id={id} className="text-md sm:text-lg font-medium mt-4 mb-2 text-primary-300">
        {children}
      </h5>
    );
  },
  h6: ({children}: any) => {
    const id = createHeadingId(String(children), 6);
    return (
      <h6 id={id} className="text-base font-medium mt-4 mb-2 text-gray-300">
        {children}
      </h6>
    );
  },
  // Custom list renderers
  ul: ({children}: any) => (
    <ul className="list-disc pl-6 my-4 space-y-2 text-gray-300">{children}</ul>
  ),
  ol: ({children}: any) => (
    <ol className="list-decimal pl-6 my-4 space-y-2 text-gray-300">{children}</ol>
  ),
  li: ({children}: any) => (
    <li className="pl-1">{children}</li>
  ),
  // Custom table renderers
  table: ({children}: any) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse overflow-hidden bg-gray-950 shadow-xl rounded-lg">
        {children}
      </table>
    </div>
  ),
  thead: ({children}: any) => (
    <thead className="bg-gray-900 text-white border-b border-gray-800">
      {children}
    </thead>
  ),
  tbody: ({children}: any) => (
    <tbody className="divide-y divide-gray-800">
      {children}
    </tbody>
  ),
  tr: ({children, isHeader}: any) => (
    <tr className={isHeader ? "" : "hover:bg-gray-900/30 transition-colors"}>
      {children}
    </tr>
  ),
  th: ({children}: any) => (
    <th className="px-4 py-3 text-left font-semibold text-gray-300 border-r border-gray-800 last:border-r-0">
      {children}
    </th>
  ),
  td: ({children}: any) => (
    <td className="px-4 py-3 text-gray-300 border-r border-gray-800 last:border-r-0">
      {children}
    </td>
  ),
  // Hyperlink renderer with custom styling
  a({node, href, children, ...props}: any) {
    const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'));
    return (
      <a 
        href={href}
        className="text-primary-400 hover:text-primary-300 underline decoration-primary-600 decoration-1 underline-offset-2 hover:decoration-2 transition-all duration-200"
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        {...props}
      >
        {children}
        {isExternal && (
          <span className="inline-block ml-1 text-xs">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="inline-block h-3 w-3" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              strokeWidth={2}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
              />
            </svg>
          </span>
        )}
      </a>
    );
  }
}; 

// Copy button component with copy-to-clipboard functionality
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`
        text-xs font-medium px-2 py-1 rounded transition-all duration-200 flex items-center gap-1
        ${copied 
          ? 'bg-green-800 text-green-100' 
          : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white hover:shadow-md transform hover:-translate-y-0.5'
        }
      `}
      aria-label={copied ? 'Copied!' : 'Copy code'}
    >
      {copied ? (
        <>
          <CheckIcon className="w-3.5 h-3.5" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <CopyIcon className="w-3.5 h-3.5" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

// Copy icon component
function CopyIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" 
      />
    </svg>
  );
}

// Check icon component
function CheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M5 13l4 4L19 7" 
      />
    </svg>
  );
} 
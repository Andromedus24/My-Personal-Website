"use client"

import { useAppContext } from '@/context/AppContext';
import { useState, useRef, useEffect } from 'react';
import { MacWindow } from '@/components/MacWindow';

interface BlogProps {
  id: string;
  name: string;
  position: { x: number, y: number };
  zIndex: number;
}

export function Blog({ id, name, position, zIndex }: BlogProps) {
  const { bringToFront, minimizeApp, openApps } = useAppContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const [windowSize, setWindowSize] = useState({ width: 450, height: 400 });
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  
  // Use size from the app context if available
  useEffect(() => {
    // Find this specific app in openApps to get its size
    const thisApp = openApps.find(app => app.id === id);
    if (thisApp?.size) {
      setWindowSize(thisApp.size);
    } else {
      // Fallback to calculated size
      const calculateSize = () => {
        const width = Math.min(600, Math.max(500, window.innerWidth * 0.45));
        const height = Math.min(600, Math.max(500, window.innerHeight * 0.7));
        setWindowSize({ width, height });
      };
      
      calculateSize();
    }
    
    // Add resize listener for responsive adjustments
    const handleResize = () => {
      // Only recalculate if no explicit size is set
      if (!openApps.find(app => app.id === id)?.size) {
        const width = Math.min(600, Math.max(500, window.innerWidth * 0.45));
        const height = Math.min(600, Math.max(500, window.innerHeight * 0.7));
        setWindowSize({ width, height });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [id, openApps]);

  const handleClick = () => {
    bringToFront(id);
  };

  // Function to make window bigger
  const makeWindowBigger = () => {
    // Calculate ~90% of window size for maximized view
    const maxWidth = Math.round(window.innerWidth * 0.9);
    const maxHeight = Math.round(window.innerHeight * 0.9);
    
    setWindowSize({ width: maxWidth, height: maxHeight });
  };

  // Function to make window smaller
  const makeWindowSmaller = () => {
    minimizeApp(id);
  };

  // Blog posts
  const blogPosts = [
    {
      id: 1,
      title: "A Thesis on Dreamers, Idealists, and Practicalists",
      subtitle: "What drives who we are and what we do internally...",
      date: "October 24, 2025",
      isPinned: true,
      content: ``
    }
  ];

  // Function to go back to the post list
  const backToList = () => {
    setSelectedPost(null);
  };

  // Print functionality
  const handlePrint = () => {
    const printContent = document.createElement('div');
    const currentPost = blogPosts.find(post => post.id === selectedPost);
    
    if (!currentPost) return;
    
    // Create a styled version of the content for printing
    printContent.innerHTML = `
      <html>
        <head>
          <title>${currentPost.title}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              line-height: 1.6;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 8px;
            }
            .subtitle {
              font-style: italic;
              color: #666;
              margin-bottom: 24px;
            }
            .date {
              margin-bottom: 32px;
              color: #555;
              font-size: 14px;
            }
            .content {
              font-size: 14px;
            }
            p {
              margin-bottom: 16px;
            }
          </style>
        </head>
        <body>
          <h1>${currentPost.title}</h1>
          ${currentPost.subtitle ? `<div class="subtitle">${currentPost.subtitle}</div>` : ''}
          <div class="date">Published: ${currentPost.date}</div>
          <div class="content">
            ${currentPost.content.split('\n\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.close();
      printWindow.focus();
      // Slight delay to ensure content is loaded
      setTimeout(() => {
        printWindow.print();
        // Close the window after print dialog is closed (or allow user to keep it open)
      }, 300);
    }
  };
  
  // Share functionality
  const handleShare = () => {
    const currentPost = blogPosts.find(post => post.id === selectedPost);
    if (!currentPost) return;
    
    // Create share text with title and metadata
    const shareText = `${currentPost.title}\n${currentPost.subtitle || ''}\nPublished: ${currentPost.date}\n\nShared from Ronak's Blog`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareText).then(() => {
      // Show notification
      setShowNotification(true);
      
      // Hide notification after 2 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 2000);
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* External control buttons */}
      <div style={{ position: 'absolute', top: '-18px', right: '50%', zIndex: 99999, display: 'flex', gap: '4px' }}>
        <button 
          onClick={makeWindowBigger}
          style={{ 
            width: '12px', 
            height: '12px', 
            background: '#28c941', 
            border: '1px solid #14ae2c',
            borderRadius: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#006400',
            cursor: 'pointer',
            lineHeight: '10px',
            padding: 0,
            textAlign: 'center'
          }}
        >
          <span style={{ marginLeft: '0.5px', marginTop: '-0.5px' }}>+</span>
        </button>
        <button 
          onClick={makeWindowSmaller}
          style={{ 
            width: '12px', 
            height: '12px', 
            background: '#ffbd2e', 
            border: '1px solid #e09e1a',
            borderRadius: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#985700',
            cursor: 'pointer',
            lineHeight: '11px',
            padding: 0
          }}
        >
          −
        </button>
      </div>
      
      <MacWindow
        id={id}
        title={name}
        defaultPosition={position}
        zIndex={zIndex}
        onFocus={handleClick}
        customStyles={{
          width: `${windowSize.width}px`,
          height: `${windowSize.height}px`,
          maxWidth: 'calc(100vw - 160px)', // Leave space for icons
          maxHeight: 'calc(100vh - 150px)'  // Space above dock
        }}
        isActive={true}
      >
        <div 
          className="h-full overflow-auto"
          ref={contentRef}
        >
          {/* Navigation toolbar */}
          <div className="bg-gray-200 border-b border-gray-400 p-2 flex items-center" style={{ height: '32px' }}>
            <div style={{ width: '60px', textAlign: 'left' }}>
              {selectedPost !== null && (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedPost(null);
                  }} 
                  className="px-1.5 py-0.5 text-xs bg-white border border-gray-400 rounded shadow-sm hover:bg-gray-100 z-10"
                  style={{ fontSize: '10px' }}
                >
                  Back
                </button>
              )}
            </div>
            <div className="flex-1 text-center font-bold text-sm">
              Ronak&apos;s Blog
            </div>
            <div style={{ width: '60px' }}></div>
          </div>
          
          {/* Address bar */}
          <div className="bg-gray-100 border-b border-gray-400 p-2 flex items-center">
            <span className="text-xs mr-2" style={{ paddingLeft: '2px' }}>File:</span>
            <div className="flex-1 bg-white border border-gray-400 px-2 py-1 text-xs rounded">
              {selectedPost !== null 
                ? `users/ronak_prabhu/blog/${blogPosts.find(post => post.id === selectedPost)?.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}` 
                : 'users/ronak_prabhu/blog'}
            </div>
          </div>
          
          {selectedPost === null ? (
            // Blog post list
            <div className="p-4" style={{ backgroundColor: '#f6eee3' }}>
              <h2 className="text-xl mb-2 font-bold border-b-2 border-gray-300 pb-2">Blog posts, thoughts, rambles</h2>
              
              {blogPosts.map(post => (
                <div 
                  key={post.id} 
                  className="mb-5 pb-4 border-b border-gray-200 cursor-pointer p-2 rounded transition-colors"
                  onClick={() => setSelectedPost(post.id)}
                  style={{ backgroundColor: '#f6eee3' }}
                >
                  {post.isPinned && (
                    <div className="flex items-center mb-1 text-gray-500" style={{ fontFamily: 'var(--mac-font)', fontSize: '10px' }}>
                      <img 
                        src="/assets/pushpin.svg" 
                        alt="Pinned" 
                        className="w-3 h-3 mr-1 opacity-70"
                        style={{ display: 'inline-block' }}
                      />
                      <span>PINNED</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-lg font-bold text-blue-800">{post.title}</h3>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">{post.date}</span>
                  </div>
                  {post.subtitle && (
                    <p className="text-sm text-gray-700 italic mb-2">{post.subtitle}</p>
                  )}
                  <p className="text-gray-600 text-sm line-clamp-3" style={{ 
                    fontFamily: 'Monaco, monospace', 
                    fontSize: '12px', 
                    WebkitFontSmoothing: 'none',
                    fontSmooth: 'never',
                    letterSpacing: '-0.2px'
                  }}
                  dangerouslySetInnerHTML={{ __html: post.content.substring(0, 180) + '...' }}
                  >
                  </p>
                  <button 
                    className="mt-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded border border-blue-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPost(post.id);
                    }}
                  >
                    Read more →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            // Single blog post view
            <div className="p-5" style={{ backgroundColor: '#f6eee3' }}>
              {blogPosts.filter(post => post.id === selectedPost).map(post => (
                <div key={post.id} style={{ backgroundColor: '#f6eee3', padding: '20px', borderRadius: '4px' }}>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2 border-b-2 border-gray-200 pb-2">{post.title}</h2>
                  {post.subtitle && (
                    <div className="text-lg text-gray-700 italic mb-4">{post.subtitle}</div>
                  )}
                  <div className="mb-4 px-3 py-2 text-sm text-gray-600 rounded" style={{ backgroundColor: '#ede2d5' }}>
                    <span className="font-semibold">Published:</span> {post.date}
                  </div>
                  <div className="leading-relaxed space-y-4" style={{ 
                    fontFamily: 'Monaco, monospace', 
                    fontSize: '12px', 
                    WebkitFontSmoothing: 'none',
                    fontSmooth: 'never',
                    letterSpacing: '-0.2px',
                    lineHeight: 1.6
                  }}>
                    {post.content.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-4" dangerouslySetInnerHTML={{ __html: paragraph }}></p>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedPost(null);
                      }} 
                      className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                    >
                      ← Back to all posts
                    </button>
                    <div className="flex space-x-2">
                      <button 
                        className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded border border-blue-200"
                        onClick={handleShare}
                      >
                        Share
                      </button>
                      <button 
                        className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded border border-gray-200"
                        onClick={handlePrint}
                      >
                        Print
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Clipboard notification - Mac OS 9 style */}
          {showNotification && (
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-700 shadow-lg p-4 min-w-60 text-center"
              style={{
                fontFamily: 'Chicago, monospace',
                fontSize: '12px',
                boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
                zIndex: 1000
              }}
            >
              <div className="flex flex-col items-center">
                <div className="mb-2 font-bold">Note</div>
                <div className="border-t border-gray-300 w-full my-1"></div>
                <div className="py-2">Post details copied to clipboard.</div>
                <button
                  className="mt-2 px-4 py-1 border border-gray-400 bg-gray-200 rounded text-xs"
                  onClick={() => setShowNotification(false)}
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </div>
      </MacWindow>
    </div>
  );
} 
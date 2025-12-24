'use client';

export default function About() {
  return (
    <div className="container">
      <main className="main">
        <h1 className="title">About Dungeon Crawler API</h1>
        <div className="content">
          <p>
            This is a Next.js application for managing dungeon crawler games.
            It provides both web pages and API endpoints.
          </p>
          
          <h2>Features</h2>
          <ul>
            <li>Server-side rendering with Next.js</li>
            <li>RESTful API endpoints</li>
            <li>TypeScript for type safety</li>
            <li>Ready for Vercel deployment</li>
          </ul>
          
          <h2>Available APIs</h2>
          <ul>
            <li><code>/api/hello</code> - Sample greeting endpoint</li>
            <li><code>/api/dungeon</code> - Dungeon data endpoint</li>
          </ul>
          
          <a href="/" className="back-link">← Back to Home</a>
        </div>
      </main>
      
      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: linear-gradient(to bottom, #2c3e50, #1a1a1a);
        }

        .main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          max-width: 800px;
        }

        .title {
          margin: 0 0 2rem 0;
          line-height: 1.15;
          font-size: 3rem;
          text-align: center;
          color: #ffffff;
        }

        .content {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid #4a5568;
          border-radius: 10px;
          padding: 2rem;
          color: #ffffff;
        }

        .content p {
          font-size: 1.2rem;
          line-height: 1.6;
          color: #cccccc;
          margin-bottom: 1.5rem;
        }

        .content h2 {
          font-size: 1.8rem;
          margin: 2rem 0 1rem 0;
          color: #ffffff;
        }

        .content ul {
          margin-left: 2rem;
          margin-bottom: 1.5rem;
        }

        .content li {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #cccccc;
        }

        .content code {
          background: rgba(0, 0, 0, 0.3);
          padding: 0.2rem 0.5rem;
          border-radius: 5px;
          color: #0070f3;
        }

        .back-link {
          display: inline-block;
          margin-top: 2rem;
          padding: 0.8rem 1.5rem;
          background: #0070f3;
          color: white;
          border-radius: 5px;
          transition: background 0.2s ease;
        }

        .back-link:hover {
          background: #0051cc;
        }
      `}</style>
    </div>
  );
}

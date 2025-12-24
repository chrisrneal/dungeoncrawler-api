'use client';

export default function Home() {
  return (
    <div className="container">
      <main className="main">
        <h1 className="title">Dungeon Crawler API</h1>
        <p className="description">
          Welcome to the Dungeon Crawler management app!
        </p>
        
        <div className="grid">
          <a href="/api/hello" className="card">
            <h2>API Example &rarr;</h2>
            <p>Try out the sample API endpoint</p>
          </a>
          
          <a href="/about" className="card">
            <h2>About &rarr;</h2>
            <p>Learn more about this application</p>
          </a>
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
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
          text-align: center;
          color: #ffffff;
        }

        .description {
          text-align: center;
          line-height: 1.5;
          font-size: 1.5rem;
          color: #cccccc;
          margin-top: 1rem;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          max-width: 800px;
          margin-top: 3rem;
          gap: 1rem;
        }

        .card {
          margin: 1rem;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #4a5568;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
          width: 300px;
          background: rgba(255, 255, 255, 0.05);
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h2 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
          color: #ffffff;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
          color: #cccccc;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }

          .card {
            width: 90%;
          }
        }
      `}</style>
    </div>
  );
}

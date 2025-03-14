import { useNavigate } from "react-router";
import "./Home.scss"

const Home:React.FC= () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/login");
  }

  return (
    <section className="background">
      <h1>
        <span className="title">
          Be part of
        </span>
        <span className="title title-description">
        tomorrow's
        </span>
        <span className="title title-large">
        EUROPE
        </span>
      </h1>
      <div className="button-section">
        <button className="button-wide cta-orange" onClick={handleNavigate}>Find a game</button>
        <button className="button-wide " onClick={handleNavigate}>Discover</button>
      </div>
        
    </section>
  )

}

export default Home;
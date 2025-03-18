import { useNavigate } from "react-router";
import "./Home.scss"
import Background from "../../components/Background/Background";
import Button from "../../components/Button/Button";
import Timer from "../../components/Timer/Timer"

const Home:React.FC= () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/login");
  }

  const handleTimeUp = () => {
    window.alert("Time's up")
  }

  return (
    <section>
      <Background />
      <Timer duration={10} onTimeUp={handleTimeUp} />
      <div className="background">
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
        {/* <button className="button-wide cta-orange" onClick={handleNavigate}>Find a game</button> */}
        {/* <button className="button-wide " onClick={handleNavigate}>Discover</button> */}
        <Button className="button-wide cta-orange" onClick={handleNavigate} value={"Find a game"} type={"button"}/>
      </div>
      </div>
    </section>
  )

}

export default Home;
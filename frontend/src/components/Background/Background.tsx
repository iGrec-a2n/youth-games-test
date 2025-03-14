import styled, { css } from "styled-components";

// 🎨 Définition des couleurs
const primaryColor = "#d7c200"; // Jaune
const secondaryColor = "#4d2c91"; // Violet foncé
const lightColor = "#f3f2f9ff"; // Fond clair
const barColor = "#3a215f"; // Pour les bandes

// 📌 Styles réutilisables pour les cercles
const Circle = styled.div<{ size: number; bgColor?: string; top?: string; right?: string; left?: string; bottom?: string }>`
  position: absolute;
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  background-color: ${(props) => props.bgColor || primaryColor};
  border-radius: 50%;
  ${(props) =>
    props.top &&
    css`
      top: ${props.top};
    `}
  ${(props) =>
    props.right &&
    css`
      right: ${props.right};
    `}
  ${(props) =>
    props.left &&
    css`
      left: ${props.left};
    `}
  ${(props) =>
    props.bottom &&
    css`
      bottom: ${props.bottom};
    `}
`;

// 📌 Demi-cercle
const SemiCircle = styled.div`
  position: absolute;
  width: 250px;
  height: 125px;
  background-color: ${secondaryColor};
  border-top-left-radius: 125px;
  border-top-right-radius: 125px;
  // border-bottom-right-radius: 225px;
  transform: rotate(-135deg);
  transform-origin: center;

  left: 0px;
  top: 70px;
`;

// 📌 Bandes diagonales
const StripedBar = styled.div`
  position: absolute;
  top: 200px;
  left: 180px;
  width: 280px;
  height: 30px;
  background: repeating-linear-gradient(
    90deg,
    ${barColor} 0%,
    ${barColor} 5%,
    transparent 5%,
    transparent 10%
  );
  transform: rotate(-135deg);
`;

// 📌 Fond principal
const BackgroundContainer = styled.div`
  position: absolute;
  width: 100vw;
  height: 100vh;
  background-color: ${lightColor};
  overflow: hidden;
  z-index: -1;
`;

// 🚀 Composant Principal
const Background: React.FC = () => {
  return (
    <BackgroundContainer>
      <Circle size={300} top="-50px" right="-80px" />
      <Circle size={200} bgColor={secondaryColor} bottom="100px" right="50px" />
      <Circle size={100} bgColor={barColor} bottom="100px" left="190px" />
      <SemiCircle />
      <StripedBar />
    </BackgroundContainer>
  );
};

export default Background;

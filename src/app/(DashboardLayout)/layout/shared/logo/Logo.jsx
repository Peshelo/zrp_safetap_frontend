import { useSelector } from 'react-redux';
import Link from "next/link";
import { styled } from "@mui/material/styles";
import Image from "next/image";

const Logo = () => {
  const customizer = useSelector((state) => state.customizer);
  const LinkStyled = styled(Link)(() => ({
    height: customizer.TopbarHeight,
    width: customizer.isCollapse ? "40px" : "180px",
    overflow: "hidden",
    display: "block",
  }));

  if (customizer.activeDir === "ltr") {
    return (
      <LinkStyled href="/">
        {customizer.activeMode === "dark" ? (
          <Image
            src="/images/zrp.jpg"
            alt="logo"
             objectFit='contain'
          objectPosition='center'
            height={customizer.TopbarHeight}
            width={customizer.TopbarHeight}
            priority
          />
        ) : (
          <Image
            src={"/images/zrp.jpg"}
            alt="logo"
             objectFit='contain'
          objectPosition='center'
            height={customizer.TopbarHeight}
            width={customizer.TopbarHeight}
            priority
          />
        )}
      </LinkStyled>
    );
  }

  return (
    <LinkStyled href="/">
      {customizer.activeMode === "dark" ? (
        <Image
          src="/images/zrp.jpg"
          alt="logo"
           objectFit='contain'
          objectPosition='center'
          height={customizer.TopbarHeight}
          width={customizer.TopbarHeight}
          priority
        />
      ) : (
        <Image
          src="/images/zrp.jpg"
          alt="logo"
          height={customizer.TopbarHeight}
          objectFit='contain'
          objectPosition='center'
          width={customizer.TopbarHeight}
          priority
        />
      )}
    </LinkStyled>
  );
};

export default Logo;

import CardsSection from "../components/CardsCarousel/CardsSection";
import Header from "../components/Header/Header";
import Hero from "../components/Jumbotron/Hero";
import Theme from "../components/Theme";
import { ThemeProvider } from "@material-ui/core/styles";
import Footer from "../components/Footer/Footer";

export function Home() {
	return (
		<main role="main">
			<div>
				<ThemeProvider theme={Theme}>
					<Header />
					<Hero />
					<CardsSection />
					<Footer />
				</ThemeProvider>
			</div>
		</main>
	);
}

export default Home;

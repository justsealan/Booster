import React, { useState, useEffect } from "react";
import Carousel from "react-material-ui-carousel";
import Card from "@material-ui/core/Card";
import {
	Button,
	CardContent,
	CardMedia,
	Typography,
	Grid,
} from "@material-ui/core";
import { CardActions } from "@mui/material";

import Vote from "./Vote";

function PopularEnergisers() {
	const [popular, setPopular] = useState([]);

	console.log(popular);
	const api = "http://localhost:3100/api/energisers/popular";

	useEffect(() => {
		fetch(api)
			.then((res) => {
				if (!res.ok) {
					throw new Error(res.statusText);
				}
				return res.json();
			})
			.then((data) => {
				setPopular(data);
				// console.log(data);
			})
			.catch((err) => {
				console.error(err);
			});
	}, []);

	const itemsPerPage = 3;
	const [page, setPage] = React.useState(1);

	const handleChangePage = (event, value) => {
		setPage(value);
	};

	const noLoopNext = (event, value) => {
		setPage((currPage) => {
			if (currPage + 1 > Math.ceil(popular.length / itemsPerPage)) {
				return currPage;
			} else {
				return currPage + 1;
			}
		});
	};

	const noLoopPrev = (event, value) => {
		setPage((currPage) => {
			if (currPage === 1) {
				return currPage;
			} else {
				return currPage - 1;
			}
		});
	};

	const cardStyle = {
		display: "block",
		transitionDuration: "0.3s",
		height: "5vw",
	};

	return (
		<Carousel
			autoPlay={false}
			indicators={true}
			onChangePage={handleChangePage}
			next={noLoopNext}
			prev={noLoopPrev}
			sx={{ overflow: "visible", padding: 5 }}
			navButtonsProps={{
				style: {
					backgroundColor: "red",
					borderRadius: 0,
				},
			}}
		>
			<Grid component="main">
				<Grid container spacing={5}>
					{popular
						.slice((page - 1) * itemsPerPage, page * itemsPerPage)
						.map((energiser, index) => (
							<Grid item key={index} xs={4} md={4}>
								<Card>
									<CardMedia
										component="img"
										height="240px"
										image={energiser.image}
										alt={energiser.title}
									/>
									<CardContent>
										<Typography gutterBottom variant="h5" component="h2">
											{energiser.title}
										</Typography>
										<Typography
											variant="body2"
											color="textSecondary"
											component="p"
											style={cardStyle}
										>
											{energiser.description}
										</Typography>
									</CardContent>
									<CardActions disableSpacing>
										<Button
											variant="outlined"
											href={`/energiser/${energiser.id}`}
											color="primary"
										>
											Select
										</Button>
										<Vote energiser={energiser} />
									</CardActions>
								</Card>
							</Grid>
						))}
				</Grid>
			</Grid>
		</Carousel>
	);
}

export default PopularEnergisers;

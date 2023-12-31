import React, { useEffect, useState } from 'react';
import './individualgame.css';
import PieApexChart from './PieApexchart';
import StackApexChart from './StackApexchart';
import DonutApexChart from './DonutApexChart';
import StarRating from './StarRating';
import ReviewCard from './reviewCard/reviewCard';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

const IndividualGame = () => {
  const heroStyle = {
    backgroundImage: 'url("https://i.redd.it/vo9vm1fcqrp71.jpg")',
  };

  const [gameData, setGameData] = useState(null);
  const { appid } = useParams();
  const [reviews, setReviews] = useState([]);
  const [averagePlaytime, setAveragePlaytime] = useState(null);
  const [isGameSaved, setIsGameSaved] = useState(false);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const response = await axios.get(`https://api.rawg.io/api/games/${appid}`, {
          params: {
            key: 'fecf056691bd489dac7a439f05843915',
          },
        });

        setGameData(response.data);
      } catch (error) {
        console.error('Error fetching game data: ', error);
      }
    };

    fetchGameDetails();
  }, [appid]);

  const [userid, setUserID] = useState([]);
  useEffect(() => {
    axios.get('http://localhost:8080/loggedIn', { withCredentials: true })
      .then(res => {
        setUserID(res.data[0].user_id);
      })
      .catch(err => console.log(err));
  }, []);

  const handleSaveGame = async () => {
    try {
      const response = await axios.post('http://localhost:8080/saveGame', {
        user: userid,
        game: appid,
      });

      console.log('Save Game Response:', response.data);

      setIsGameSaved(response.data.isGameSaved);
    } catch (error) {
      console.error('Error saving game:', error);
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsResponse = await axios.get(`http://localhost:8080/getReviewsForGame`, {
          params: {
            gameID: appid,
          },
        });

        const formattedReviews = await Promise.all(reviewsResponse.data.map(async (review) => {
          const pictureBase64 = await fetchImageAsBase64(review.picture);
          return {
            userID: review.userID,
            picture: pictureBase64,
            userName: review.userName,
            review: review.review,
            playtime_seconds: review.playtime_seconds,
            playtime_minutes: review.playtime_minutes,
            playtime_hour: review.playtime_hour,
            completion_status: review.completion_status,
            difficulty: review.difficulty,
            worth_the_price: review.worth_the_price,
            rating: review.rating,
          };
        }));

        setReviews(formattedReviews);
        console.log('Fetched Reviews:', formattedReviews);

        const totalPlaytimeInSeconds = formattedReviews.reduce(
          (total, review) =>
            total +
            review.playtime_hour * 3600 +
            review.playtime_minutes * 60 +
            review.playtime_seconds,
          0
        );

        const totalReviews = formattedReviews.length;

        const avgPlaytimeInSeconds = totalReviews > 0 ? totalPlaytimeInSeconds / totalReviews : 0;

        const avgPlaytimeHour = Math.floor(avgPlaytimeInSeconds / 3600);
        const avgPlaytimeMinute = Math.floor((avgPlaytimeInSeconds % 3600) / 60);
        const avgPlaytimeSecond = Math.floor(avgPlaytimeInSeconds % 60);

        const totalRating = formattedReviews.reduce((total, review) => {
          const cappedRating = Math.min(review.rating, 5);
          return total + cappedRating;
        }, 0);

        const cappedTotalRating = Math.min(totalRating, 5 * formattedReviews.length);

        const avgRating = formattedReviews.length > 0 ? cappedTotalRating / formattedReviews.length : 0;

        const roundedAvgRating = Math.round(avgRating * 100) / 100;

        setAveragePlaytime({
          hour: avgPlaytimeHour,
          minute: avgPlaytimeMinute,
          second: avgPlaytimeSecond,
          rating: roundedAvgRating,
        });
      } catch (error) {
        console.error('Error fetching reviews for the game: ', error);
      }
    };

    fetchReviews();
  }, [appid]);

  const fetchImageAsBase64 = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error fetching image as base64:', error);
      return null;
    }
  };

  return (
    <div>
      <section className="page-top-section set-bg" style={heroStyle}>
        <div className="page-info">
          <h2>Game</h2>
          <div className="site-breadcrumb">
            <a href="/home">Home</a> /
            <span>Game</span>
          </div>
        </div>
      </section>

      <div className="page-container">
        <div className="game-container">
          {gameData ? (
            <div>
              <h1>{gameData.name}</h1>
              <div className="game-image">
                <img src={gameData.background_image} alt={gameData.name} />
              </div>
              <div className="game-info-container">
                <p>Developer: {gameData.developers && gameData.developers.map((dev) => dev.name).join(', ')}</p>
                <p>Publisher: {gameData.publishers && gameData.publishers.map((pub) => pub.name).join(', ')}</p>
                <p>Release Date: {gameData.released || 'TBD'}</p>
                <p>Genre: {gameData.genres && gameData.genres.map((genre) => genre.name).join(', ')}</p>
                <p>Platforms: {gameData.platforms && gameData.platforms.map((platform) => platform.platform.name).join(', ')}</p>
                {gameData.stores && gameData.stores.length > 0 && (
                  <div>
                    <h5>Available at:</h5>
                    <ul>
                    {gameData.stores.map((store) => (
                      <li key={store.store.id}>
                          {store.store.name}
                    
                      </li>
                    ))}
                    </ul>
                  </div>
                )}
              </div>
              
            </div>

          ) : (
            <p>Loading...</p>
          )}
          
          <div>
          <div className="button-container">
                {gameData && (
                  <Link to={`/submit/game/${gameData.id}`}>
                    <button className="btn3">Submit Review</button>
                  </Link>
                )}  
                <button className="btn3" onClick={handleSaveGame} disabled={isGameSaved}>
                  {isGameSaved ? 'Game Saved' : 'Save Game'}
                </button>
              </div>
              {gameData && (
                  <Link to={`/forum/game/${gameData.id}`}>
                    <button className="btnForum">Forum</button>
                  </Link>
                )}  
          </div>
        </div>
        
        <div className="right-content">
          <div className="summary">
            {gameData ? (
              <p>{gameData.description_raw}</p>
            ) : (
              <p>Loading...</p>
            )}
  
          </div>

          <div className='rating'>
            <h2>GamerHub Rating: {averagePlaytime?.rating ? <StarRating rating={averagePlaytime?.rating} />: 'Not rated yet'}</h2>
          </div>
          
          <div className='completion'>
            <h2>Average Completion Time:</h2>
            {averagePlaytime ? (
              <p className='time-color'>
                {' '}{`${averagePlaytime?.hour}h ${averagePlaytime?.minute}m ${averagePlaytime?.second}s`}
              </p>
            ) : (
              <p>No reviews available to calculate average completion time.</p>
            )}
          </div>


          <div className='charts'>
            <h2>Completion</h2>
            {reviews.length > 0 ? (
              <PieApexChart completionStatusData={reviews.map(review => review.completion_status)} />            ) : (
              <p>No reviews available to display completion chart.</p>
            )}
          </div>

          <div className='charts'>
          <h2>Difficulty</h2>
          {reviews.length > 0 ? (
            <StackApexChart difficultyData={reviews.map(review => review.difficulty)} />
          ) : (
            <p>No reviews available to display difficulty chart.</p>
          )}
        </div>
      
        <div className='charts'>
          <h2>Worth the Price</h2>
          {reviews.length > 0 ? (
            <DonutApexChart worthThePriceData={reviews.map(review => review.worth_the_price)} />
          ) : (
            <p>No reviews available to display worth the price chart.</p>
          )}
        </div>

          <h2>Reviews</h2>
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <ReviewCard key={index} review={review} />
            ))
          ) : (
            <p>No written reviews yet for this game.</p>
          )}

     
          

        </div>
      </div>
    </div>
  );
};

export default IndividualGame;
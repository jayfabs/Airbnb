from sqlalchemy import create_engine, Table, MetaData, func
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.automap import automap_base
from flask import Flask, jsonify, request
from flask_cors import CORS



engine = create_engine("sqlite:///airbnb_data.db")
metadata = MetaData()
metadata.reflect(bind=engine)
Base = automap_base()
Base.prepare(engine, reflect=True)

airbnb = Base.classes.airbnb_clean

session_factory = sessionmaker(bind=engine)
Session = scoped_session(session_factory)

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False
CORS(app)


@app.teardown_request
def remove_session(*args):
    Session.remove()

@app.route("/")
def welcome():
    return (
        "Welcome To The Mealbourne Airbnb Data API<br/>"
        "We Currently Offer Data On Over 20k Airbnbs In Melbourne <br/>"
        "Available Routes:<br/>"
        "/api/v1.0/GeoJson<br/>"
        "/api/v1.0/available<br/>"
    )

@app.route("/api/v1.0/GeoJson")
def all():
    features = {
        "type": "FeatureCollection",
        "features": []
    }
    for row in Session.query(airbnb).all():
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [row.longitude, row.latitude]
            },
            "properties": {
                "id": row.id,
                "neighborhood_overview": row.neighborhood_overview,
                "host_name": row.host_name,
                "host_since": row.host_since,
                "host_location": row.host_location,
                "host_response_time": row.host_response_time,
                "host_response_rate": row.host_response_rate,
                "host_acceptance_rate": row.host_acceptance_rate,
                "host_is_superhost":row.host_is_superhost,
                "host_neighbourhood":row.host_neighbourhood,
                "host_listings_count":row.host_listings_count,
                "host_total_listings_count":row.host_total_listings_count,
                "neighbourhood":row.neighbourhood,
                "neighbourhood_cleansed":row.neighbourhood_cleansed,
                "property_type":row.property_type,
                "room_type":row.room_type,
                "accommodates":row.accommodates,
                "bathrooms_text":row.bathrooms_text,
                "bedrooms":row.bedrooms,
                "beds":row.beds,
                "amenities":row.amenities,
                "price":row.price,
                "minimum_nights":row.minimum_nights,
                "maximum_nights":row.maximum_nights,
                "minimum_nights_avg_ntm":row.minimum_nights_avg_ntm,
                "maximum_nights_avg_ntm":row.maximum_nights_avg_ntm,
                "has_availability":row.has_availability,
                "availability_365":row.availability_365,
                "calendar_last_scraped":row.calendar_last_scraped,
                "number_of_reviews":row.number_of_reviews,
                "review_scores_rating":row.review_scores_rating,
                "review_scores_accuracy":row.review_scores_accuracy,
                "review_scores_cleanliness":row.review_scores_cleanliness,
                "review_scores_checkin":row.review_scores_checkin,
                "review_scores_communication":row.review_scores_communication,
                "review_scores_location":row.review_scores_location,
                "review_scores_value":row.review_scores_value,
                "instant_bookable":row.instant_bookable,
                "reviews_per_month":row.reviews_per_month
            }
        }
        features["features"].append(feature)
    return jsonify(features)


@app.route("/api/v1.0/available")
def available():
    result = []
    for row in Session.query(airbnb).all():
        if row.has_availability == "true":
            result.append({
                "id": row.id,
                "host_name": row.host_name,
                "property_type":row.property_type,
                "price":row.price,
                "has_availability": row.has_availability,
                "bathrooms_text":row.bathrooms_text,
                "bedrooms":row.bedrooms,
                "review_scores_rating":row.review_scores_rating,
                "instant_bookable":row.instant_bookable
            })
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)

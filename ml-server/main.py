import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd

from recommender import (
    popular_based_recommendation,
    hybrid_recommendation,
    load_models
)

app = FastAPI(title="NexAnime ML Recommendation Server")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load CSV dataset at startup
CSV_PATH = os.path.join(os.path.dirname(__file__), "Animeslist.csv")
print(f"Loading dataset from {CSV_PATH}...")
if not os.path.exists(CSV_PATH):
    raise FileNotFoundError(f"Could not find dataset at {CSV_PATH}")

anime_df = pd.read_csv(CSV_PATH)
print(f"Loaded {len(anime_df)} anime titles.")

# Pre-load recommendation models at startup
@app.on_event("startup")
def startup_event():
    load_models()

# Pydantic schemas for request validation
class PopularRequest(BaseModel):
    genres: Optional[str] = "All"
    rating: Optional[str] = "All"
    type: Optional[str] = "All"
    source: Optional[str] = "All"
    used_ids: Optional[List[int]] = []
    rec_type: Optional[str] = "top"
    limit: Optional[int] = 20

class HybridRequest(BaseModel):
    anime_id: int
    limit: Optional[int] = 20
    content_weight: Optional[float] = 0.5
    colab_weight: Optional[float] = 0.5

@app.get("/")
def read_root():
    return {"status": "running", "message": "NexAnime ML Recommendation Server is live"}

@app.post("/recommend/popular")
def get_popular_recommendation(req: PopularRequest):
    try:
        # Start with full dataframe
        filtered_df = anime_df
        
        # Apply filters
        if req.rating != "All":
            filtered_df = filtered_df[filtered_df['Rating'] == req.rating]
        if req.type != "All":
            filtered_df = filtered_df[filtered_df['Type'] == req.type]
        if req.source != "All":
            filtered_df = filtered_df[filtered_df['Source'] == req.source]
        if req.genres != "All" and req.genres is not None:
            filtered_df = filtered_df[filtered_df['Genres'].str.contains(req.genres, case=False, na=False)]

        # Get recommendations
        ids = popular_based_recommendation(
            df=filtered_df,
            used_ids=req.used_ids,
            K=req.limit,
            rec_type=req.rec_type
        )
        return {"anime_ids": ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommend/hybrid")
def get_hybrid_recommendation(req: HybridRequest):
    try:
        # Check if the anime_id exists in the dataset
        if req.anime_id not in anime_df['anime_id'].values:
            raise HTTPException(status_code=404, detail="Anime ID not found in dataset")
            
        ids = hybrid_recommendation(
            anime_df=anime_df,
            anime_id=req.anime_id,
            k=req.limit,
            content_weight=req.content_weight,
            colab_weight=req.colab_weight
        )
        return {"anime_ids": ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

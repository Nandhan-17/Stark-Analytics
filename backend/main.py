import io
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from data_processor import DataProcessingEngine
import pandas as pd
import numpy as np

app = FastAPI(
    title="Stark Analytics Engine",
    description="Automated Full-Stack Data Engineering, ML Analytics & Visualization API",
    version="1.0.0"
)

# Enable CORS for local Next.js / Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Stark Analytics API Engine is Running", "version": "1.0.0"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Stark Analytics Engine"}

@app.post("/api/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    """Accept and process user uploaded CSV file dynamically."""
    if not file.filename.endswith(".csv") and not file.content_type in ["text/csv", "application/vnd.ms-excel"]:
        raise HTTPException(status_code=400, detail="File must be a valid .csv format.")
    
    try:
        contents = await file.read()
        engine = DataProcessingEngine(contents, filename=file.filename)
        results = engine.process_all()
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data processing error: {str(e)}")

@app.get("/api/sample-dataset/{dataset_type}")
def get_sample_dataset(dataset_type: str):
    """Generate and process a rich sample dataset dynamically."""
    np.random.seed(42)
    n_rows = 150

    if dataset_type == "ecommerce":
        dates = pd.date_range(start="2024-01-01", periods=n_rows, freq="D")
        categories = np.random.choice(["Electronics", "Clothing", "Home & Kitchen", "Books", "Beauty"], n_rows)
        sales = np.random.normal(loc=250, scale=80, size=n_rows).round(2)
        sales[sales < 10] = 15.0
        # Add intentional anomalies
        sales[12] = 1850.0
        sales[88] = 2200.0
        quantity = np.random.randint(1, 10, size=n_rows)
        discount = np.random.choice([0.0, 0.05, 0.10, 0.15, 0.20], n_rows)
        profit = (sales * (1 - discount) * 0.35 - (quantity * 4)).round(2)
        customer_rating = np.random.choice([3.0, 3.5, 4.0, 4.5, 5.0], n_rows)

        df = pd.DataFrame({
            "Order_Date": dates.strftime("%Y-%m-%d"),
            "Product_Category": categories,
            "Sales_Amount": sales,
            "Quantity_Sold": quantity,
            "Discount_Rate": discount,
            "Net_Profit": profit,
            "Customer_Rating": customer_rating
        })
        filename = "Ecommerce_Sales_Analytics.csv"

    elif dataset_type == "healthcare":
        age = np.random.randint(18, 85, size=n_rows)
        gender = np.random.choice(["Male", "Female"], n_rows)
        bmi = np.random.normal(loc=26.5, scale=4.2, size=n_rows).round(1)
        blood_pressure = np.random.normal(loc=122, scale=14, size=n_rows).round(0)
        cholesterol = np.random.normal(loc=195, scale=30, size=n_rows).round(0)
        cholesterol[5] = 450.0
        cholesterol[95] = 490.0
        glucose = (bmi * 2.1 + age * 0.4 + np.random.normal(0, 10, n_rows)).round(1)
        admission_type = np.random.choice(["Emergency", "Elective", "Urgent"], n_rows)

        df = pd.DataFrame({
            "Patient_Age": age,
            "Gender": gender,
            "BMI": bmi,
            "Blood_Pressure": blood_pressure,
            "Cholesterol_Level": cholesterol,
            "Glucose_Level": glucose,
            "Admission_Type": admission_type
        })
        filename = "Healthcare_Patient_Metrics.csv"

    else:  # hr analytics default
        department = np.random.choice(["Engineering", "Sales", "Marketing", "HR", "Finance"], n_rows)
        experience_years = np.random.randint(1, 20, size=n_rows)
        salary = (45000 + experience_years * 3800 + np.random.normal(0, 5000, n_rows)).round(0)
        salary[22] = 280000.0  # Anomaly
        satisfaction = np.random.choice([1, 2, 3, 4, 5], n_rows, p=[0.1, 0.15, 0.35, 0.25, 0.15])
        projects_completed = (experience_years * 1.5 + np.random.randint(1, 5, n_rows)).astype(int)
        remote_ratio = np.random.choice([0, 50, 100], n_rows)

        df = pd.DataFrame({
            "Department": department,
            "Experience_Years": experience_years,
            "Annual_Salary": salary,
            "Job_Satisfaction": satisfaction,
            "Projects_Completed": projects_completed,
            "Remote_Work_Ratio": remote_ratio
        })
        filename = "HR_Employee_Performance.csv"

    csv_bytes = df.to_csv(index=False).encode("utf-8")
    engine = DataProcessingEngine(csv_bytes, filename=filename)
    return engine.process_all()

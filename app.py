import json
import os
import shutil
from datetime import datetime
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

os.makedirs("data", exist_ok=True)
DATA_FILE = "data/quest_data.json"

class DiarioEntry(BaseModel):
    player_name: str
    level_name: str
    activity_text: str
    learned: str
    not_understood: str
    explore_more: str

class SideQuestEntry(BaseModel):
    player_name: str
    quest_name: str
    delivery_text: str

class AcceptMission(BaseModel):
    player_name: str

class NextLevelEntry(BaseModel):
    player_name: str

def load_all_data() -> dict:
    if not os.path.exists(DATA_FILE):
        return {}
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
        # Migrate old format if needed
        if "player_name" in data and not isinstance(data.get("player_name"), dict):
            # Old single-user format detected, wipe or migrate
            if data["player_name"]:
                return {
                    data["player_name"]: {
                        "mission_accepted": data.get("mission_accepted", False),
                        "current_level": data.get("current_level", 1),
                        "diario_logs": data.get("diario_logs", []),
                        "side_quests_completed": data.get("side_quests_completed", [])
                    }
                }
            return {}
        return data

def save_all_data(data: dict) -> None:
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

def get_player_state(player_name: str, data: dict = None) -> dict:
    if data is None:
        data = load_all_data()
    return data.get(player_name, {
        "mission_accepted": False,
        "current_level": 1,
        "diario_logs": [],
        "side_quests_completed": []
    })

@app.get("/api/status")
def get_status(player_name: str = None):
    if not player_name:
        raise HTTPException(status_code=400, detail="player_name is required")
    data = load_all_data()
    if player_name not in data:
        raise HTTPException(status_code=404, detail="Player not found")
    state = data[player_name]
    state["player_name"] = player_name
    return state

@app.get("/api/admin/all-players")
def get_all_players(admin_name: str = None):
    if not admin_name:
        raise HTTPException(status_code=400, detail="admin_name is required")
    if admin_name != "Carol":
        raise HTTPException(status_code=403, detail="Acesso não autorizado")
    data = load_all_data()
    return data

@app.get("/api/team-status")
def get_team_status():
    data = load_all_data()
    team = []
    for name, state in data.items():
        if name != "Carol" and state.get("mission_accepted", False):
            team.append({"name": name, "level": state.get("current_level", 1)})
    return {"team": team}

@app.post("/api/accept-mission")
def accept_mission(entry: AcceptMission):
    if entry.player_name != "Carol":
        player_quests_file = f"data/quests_{entry.player_name}.json"
        if not os.path.exists(player_quests_file):
            raise HTTPException(status_code=403, detail="Acesso negado: Operador não cadastrado.")
            
    data = load_all_data()
    if entry.player_name not in data:
        data[entry.player_name] = {
            "mission_accepted": True,
            "current_level": 1,
            "diario_logs": [],
            "side_quests_completed": []
        }
    else:
        data[entry.player_name]["mission_accepted"] = True
        
    save_all_data(data)
    return {"status": "success"}

@app.get("/api/quests")
def get_quests(player_name: str = None):
    if not player_name:
        raise HTTPException(status_code=400, detail="player_name is required")
        
    if player_name == "Carol":
        return {"main_quests": [], "side_quests": []}

    player_quests_file = f"data/quests_{player_name}.json"
    
    if not os.path.exists(player_quests_file):
        raise HTTPException(status_code=403, detail="Acesso negado: Operador não cadastrado.")
        
    with open(player_quests_file, "r", encoding="utf-8") as f:
        return json.load(f)

@app.post("/api/diario")
def post_diario(entry: DiarioEntry):
    data = load_all_data()
    if entry.player_name not in data:
        raise HTTPException(status_code=404, detail="Player not found")
        
    data[entry.player_name]["diario_logs"].append({
        "level_name": entry.level_name,
        "activity_text": entry.activity_text,
        "learned": entry.learned,
        "not_understood": entry.not_understood,
        "explore_more": entry.explore_more,
        "timestamp": datetime.now().strftime("%d/%m/%Y %H:%M")
    })
    save_all_data(data)
    return {"status": "success"}

@app.post("/api/side-quest")
def post_side_quest(entry: SideQuestEntry):
    data = load_all_data()
    if entry.player_name not in data:
        raise HTTPException(status_code=404, detail="Player not found")
        
    if entry.quest_name not in data[entry.player_name]["side_quests_completed"]:
        data[entry.player_name]["side_quests_completed"].append(entry.quest_name)
        
    data[entry.player_name]["diario_logs"].append({
        "level_name": f"Side Quest: {entry.quest_name}",
        "learned": entry.delivery_text,
        "not_understood": "N/A",
        "explore_more": "N/A",
        "timestamp": datetime.now().strftime("%d/%m/%Y %H:%M")
    })
    save_all_data(data)
    return {"status": "success"}

@app.post("/api/next-level")
def next_level(entry: NextLevelEntry):
    data = load_all_data()
    if entry.player_name not in data:
        raise HTTPException(status_code=404, detail="Player not found")
        
    if data[entry.player_name]["current_level"] < 3:
        data[entry.player_name]["current_level"] += 1
        save_all_data(data)
        return {"status": "success"}
    raise HTTPException(status_code=400, detail="Nível máximo atingido")

@app.get("/")
def get_ui(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="index.html", 
        context={"v": datetime.now().timestamp()}
    )
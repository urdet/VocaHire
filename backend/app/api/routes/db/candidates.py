from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.db.models import Candidate, CandidateListItem, JobSession
from app.schemas.candidate import (
    Candidate as CandidateSchema,
    CandidateCreate,
    CandidateUpdate,
    CandidateListItem as CandidateListItemSchema,
    CandidateListItemCreate,
    CandidateListItemUpdate,
    CandidateWithListItemCreate
)

router = APIRouter(prefix="/candidates", tags=["candidates"])

# ---------- Endpoints pour les données personnelles (table "candidates") ----------
@router.get("/persons/", response_model=List[CandidateSchema])
def read_candidates_persons(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Récupère tous les candidats (données personnelles)"""
    return db.query(Candidate).offset(skip).limit(limit).all()

@router.post("/persons/", response_model=CandidateSchema, status_code=status.HTTP_201_CREATED)
def create_candidate_person(
    candidate: CandidateCreate,
    db: Session = Depends(get_db)
):
    """Crée un nouveau candidat (données personnelles)"""
    db_candidate = Candidate(**candidate.model_dump())
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

@router.get("/persons/{candidate_id}", response_model=CandidateSchema)
def read_candidate_person(
    candidate_id: int,
    db: Session = Depends(get_db)
):
    """Récupère un candidat par son ID"""
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidat non trouvé")
    return candidate

@router.put("/persons/{candidate_id}", response_model=CandidateSchema)
def update_candidate_person(
    candidate_id: int,
    candidate_update: CandidateUpdate,
    db: Session = Depends(get_db)
):
    """Met à jour un candidat"""
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidat non trouvé")
    
    for field, value in candidate_update.model_dump(exclude_unset=True).items():
        setattr(candidate, field, value)
    
    db.commit()
    db.refresh(candidate)
    return candidate

@router.delete("/persons/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_candidate_person(
    candidate_id: int,
    db: Session = Depends(get_db)
):
    """Supprime un candidat (attention : vérifier les références)"""
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidat non trouvé")
    
    # Optionnel : vérifier s'il est référencé dans des listes avant suppression
    db.delete(candidate)
    db.commit()
    return None

# ---------- Endpoints pour les éléments de liste (table "candidate_list_items") ----------
@router.get("/", response_model=List[CandidateListItemSchema])
def read_candidate_list_items(
    skip: int = 0,
    limit: int = 100,
    job_session_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Récupère tous les éléments de liste, filtrés éventuellement par session"""
    query = db.query(CandidateListItem)
    if job_session_id:
        query = query.filter(CandidateListItem.job_session_id == job_session_id)
    return query.offset(skip).limit(limit).all()

@router.get("/job-session/{job_session_id}", response_model=List[CandidateListItemSchema])
def read_candidates_by_session(
    job_session_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Récupère tous les candidats d'une session spécifique"""
    # Vérifier que la session existe
    job_session = db.query(JobSession).filter(JobSession.id == job_session_id).first()
    if not job_session:
        raise HTTPException(status_code=404, detail="Session non trouvée")
    
    return db.query(CandidateListItem).filter(
        CandidateListItem.job_session_id == job_session_id
    ).offset(skip).limit(limit).all()

@router.post("/", response_model=CandidateListItemSchema, status_code=status.HTTP_201_CREATED)
def create_candidate_list_item(
    item: CandidateListItemCreate,
    db: Session = Depends(get_db)
):
    """Crée un nouvel élément de liste (association candidat-session)"""
    # Vérifier que la session existe
    job_session = db.query(JobSession).filter(JobSession.id == item.job_session_id).first()
    if not job_session:
        raise HTTPException(status_code=404, detail="Session non trouvée")
    
    # Vérifier que le candidat existe
    candidate = db.query(Candidate).filter(Candidate.id == item.candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidat non trouvé")
    
    db_item = CandidateListItem(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.post("/with-candidate/", response_model=CandidateListItemSchema, status_code=status.HTTP_201_CREATED)
def create_candidate_and_list_item(
    data: CandidateWithListItemCreate,
    db: Session = Depends(get_db)
):
    """Crée un nouveau candidat et l'ajoute à une session en une seule requête"""
    # Vérifier que la session existe
    job_session = db.query(JobSession).filter(JobSession.id == data.job_session_id).first()
    if not job_session:
        raise HTTPException(status_code=404, detail="Session non trouvée")
    
    # Créer le candidat
    db_candidate = Candidate(**data.candidate.model_dump())
    db.add(db_candidate)
    db.flush()  # obtient l'ID sans commit
    
    # Créer l'élément de liste
    list_item_data = {
        "job_session_id": data.job_session_id,
        "candidate_id": db_candidate.id,
        "list_order": data.list_order,
        "notes": data.notes,
        "score": data.score,
        "status": data.status
    }
    db_item = CandidateListItem(**list_item_data)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/{item_id}", response_model=CandidateListItemSchema)
def read_candidate_list_item(
    item_id: int,
    db: Session = Depends(get_db)
):
    """Récupère un élément de liste par son ID"""
    item = db.query(CandidateListItem).filter(CandidateListItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Élément de liste non trouvé")
    return item

@router.put("/{item_id}", response_model=CandidateListItemSchema)
def update_candidate_list_item(
    item_id: int,
    item_update: CandidateListItemUpdate,
    db: Session = Depends(get_db)
):
    """Met à jour un élément de liste"""
    item = db.query(CandidateListItem).filter(CandidateListItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Élément de liste non trouvé")
    
    for field, value in item_update.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_candidate_list_item(
    item_id: int,
    db: Session = Depends(get_db)
):
    """Supprime un élément de liste"""
    item = db.query(CandidateListItem).filter(CandidateListItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Élément de liste non trouvé")
    
    db.delete(item)
    db.commit()
    return None
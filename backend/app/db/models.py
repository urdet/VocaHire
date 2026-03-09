from sqlalchemy import Column, Integer, String, DateTime, Text, Numeric, Boolean, ForeignKey, CheckConstraint, UniqueConstraint, Float, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base
from sqlalchemy import Column, Integer, String, JSON, DateTime
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(255), nullable=False)       # new
    last_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    date_of_birth = Column(DateTime)
    registered_at = Column(DateTime, server_default=func.current_timestamp())
    role = Column(String(20), nullable=False)
    bio = Column(Text)
    is_active = Column(Boolean, nullable=False, default=True)

    # Relationships
    job_sessions = relationship("JobSession", back_populates="owner", cascade="all, delete-orphan")
    training_sessions = relationship("TrainingSession", back_populates="user", cascade="all, delete-orphan")

class JobSession(Base):
    __tablename__ = "job_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_type = Column(String(50))
    owner_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255))
    job_title = Column(String(255))
    qualities = Column(Text)
    scheduled_date = Column(DateTime)
    created_at = Column(DateTime, server_default=func.current_timestamp(), nullable=False)
    updated_at = Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=False)

    owner = relationship("User", back_populates="job_sessions")

    candidates = relationship(
        "CandidateListItem",
        back_populates="job_session",
        cascade="all, delete-orphan"
    )

    interviews = relationship(
        "Interview",
        back_populates="job_session",
        cascade="all, delete-orphan"
    )

class Candidate(Base):
    __tablename__ = "candidates"
    id = Column(Integer, primary_key=True)
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    city = Column(String(255))
    cin = Column(String(20))
    email = Column(String(255))
    phone = Column(String(20))
    infos = Column(Text)
    # relation
    list_items = relationship("CandidateListItem", back_populates="candidate")

class CandidateListItem(Base):
    __tablename__ = "candidate_list_items"

    id = Column(Integer, primary_key=True)
    job_session_id = Column(Integer, ForeignKey("job_sessions.id", ondelete="CASCADE"))
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    list_order = Column(Integer)
    notes = Column(Text)
    score = Column(Float)
    status = Column(String(50))

    job_session = relationship("JobSession", back_populates="candidates")

    candidate = relationship(
        "Candidate",
        back_populates="list_items"
    )

    interview = relationship(
        "Interview",
        back_populates="candidate_item",
        uselist=False
    )
    
class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)

    job_session_id = Column(
        Integer,
        ForeignKey("job_sessions.id", ondelete="CASCADE"),
        nullable=False
    )

    candidate_item_id = Column(
        Integer,
        ForeignKey("candidate_list_items.id", ondelete="CASCADE"),
        nullable=False,
        unique=True
    )

    audio_path = Column(Text, nullable=False)
    status = Column(String(30), nullable=False, default="processing")

    created_at = Column(DateTime, server_default=func.current_timestamp(), nullable=False)
    updated_at = Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=False)

    job_session = relationship("JobSession", back_populates="interviews")

    candidate_item = relationship(
        "CandidateListItem",
        back_populates="interview"
    )

    transcription_segments = relationship(
        "TranscriptionSegment",
        back_populates="interview",
        cascade="all, delete-orphan"
    )

    speaker_segments = relationship(
        "SpeakerSegment",
        back_populates="interview",
        cascade="all, delete-orphan"
    )

    analysis_result = relationship(
        "AnalysisResult",
        back_populates="interview",
        uselist=False,
        cascade="all, delete-orphan"
    )

class TranscriptionSegment(Base):
    __tablename__ = "transcription_segments"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False)
    start_seconds = Column(Numeric(10, 3))
    end_seconds = Column(Numeric(10, 3))
    transcript = Column(Text)
    created_at = Column(DateTime, nullable=False, server_default=func.current_timestamp())

    # Relationships
    interview = relationship("Interview", back_populates="transcription_segments")

    __table_args__ = (
        CheckConstraint('start_seconds >= 0', name='chk_start_seconds_positive'),
        CheckConstraint('end_seconds > start_seconds', name='chk_end_seconds_gt_start'),
    )

class SpeakerSegment(Base):
    __tablename__ = "speaker_segments"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False)
    speaker_label = Column(String(100))
    start_seconds = Column(Numeric(10, 3))
    end_seconds = Column(Numeric(10, 3))
    text = Column(Text)
    created_at = Column(DateTime, nullable=False, server_default=func.current_timestamp())

    # Relationships
    interview = relationship("Interview", back_populates="speaker_segments")

    __table_args__ = (
        CheckConstraint('start_seconds >= 0', name='chk_speaker_start_positive'),
        CheckConstraint('end_seconds > start_seconds', name='chk_speaker_end_gt_start'),
    )

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False, unique=True)
    content_relevance = Column(Numeric(5, 2))
    vocal_confidence = Column(Numeric(5, 2))
    clarity_of_speech = Column(Numeric(5, 2))
    fluency = Column(Numeric(5, 2))
    feedback = Column(Text)
    final_score = Column(Numeric(5, 2))
    created_at = Column(DateTime, nullable=False, server_default=func.current_timestamp())

    # Relationships
    interview = relationship("Interview", back_populates="analysis_result")

    __table_args__ = (
        CheckConstraint('content_relevance BETWEEN 0 AND 100', name='chk_content_relevance_range'),
        CheckConstraint('vocal_confidence BETWEEN 0 AND 100', name='chk_vocal_confidence_range'),
        CheckConstraint('clarity_of_speech BETWEEN 0 AND 100', name='chk_clarity_range'),
        CheckConstraint('fluency BETWEEN 0 AND 100', name='chk_fluency_range'),
        CheckConstraint('final_score BETWEEN 0 AND 100', name='chk_final_score_range'),
    )

class TrainingSession(Base):
    __tablename__ = "training_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    audio_path = Column(Text)
    difficulty_level = Column(String(50))
    created_at = Column(DateTime, nullable=False, server_default=func.current_timestamp())

    # Relationships
    user = relationship("User", back_populates="training_sessions")


class Job(Base):

    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)

    audio_path = Column(String, nullable=False)

    status = Column(String, default="pending")

    result = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
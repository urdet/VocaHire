--
-- PostgreSQL database dump
--

\restrict X6yhnbOPfnY0Fq0GnK3gJsrldCuxloFnHdOWEFd224bv7FjUg5ebdbHQsttN2wd

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: getcandidatbyorder(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.getcandidatbyorder(cand_order integer) RETURNS TABLE(id integer, candidatorder integer, candidatfullname character varying, description text, score numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY SELECT * FROM candidaslist WHERE candidaslist.candidatOrder = cand_order;
END;
$$;


ALTER FUNCTION public.getcandidatbyorder(cand_order integer) OWNER TO postgres;

--
-- Name: getcandidatlist(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.getcandidatlist(session_id integer) RETURNS TABLE(id integer, candidatorder integer, candidatfullname character varying, description text, score numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY 
    SELECT cl.* 
    FROM session s
    JOIN candidaslist cl ON s.candidatsListID = cl.id
    WHERE s.id = session_id;
END;
$$;


ALTER FUNCTION public.getcandidatlist(session_id integer) OWNER TO postgres;

--
-- Name: getcandidatresults(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.getcandidatresults(list_id integer) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
    avg_score DECIMAL(5,2);
BEGIN
    SELECT AVG(score) INTO avg_score FROM candidaslist WHERE id = list_id;
    RETURN COALESCE(avg_score, 0);
END;
$$;


ALTER FUNCTION public.getcandidatresults(list_id integer) OWNER TO postgres;

--
-- Name: getsessiondata(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.getsessiondata(session_id integer) RETURNS TABLE(id integer, sessioncode character varying, type character varying, candidatslistid integer, userid integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY SELECT * FROM session WHERE session.id = session_id;
END;
$$;


ALTER FUNCTION public.getsessiondata(session_id integer) OWNER TO postgres;

--
-- Name: getuserdata(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.getuserdata(user_id integer) RETURNS TABLE(id integer, firstname character varying, lastname character varying, username character varying, password character varying, dateofbirth date, dateofregistration timestamp without time zone, type character varying, attribute1 character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY SELECT * FROM users WHERE users.id = user_id;
END;
$$;


ALTER FUNCTION public.getuserdata(user_id integer) OWNER TO postgres;

--
-- Name: getuserdataexist(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.getuserdataexist(user_username character varying, user_password character varying) RETURNS TABLE(id integer, firstname character varying, lastname character varying, username character varying, password character varying, dateofbirth date, dateofregistration timestamp without time zone, type character varying, attribute1 character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY SELECT * FROM users WHERE users.username = user_username AND users.password = user_password;
END;
$$;


ALTER FUNCTION public.getuserdataexist(user_username character varying, user_password character varying) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: analysis_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analysis_results (
    id integer NOT NULL,
    interview_id integer NOT NULL,
    content_relevance numeric(5,2),
    vocal_confidence numeric(5,2),
    clarity_of_speech numeric(5,2),
    fluency numeric(5,2),
    feedback text,
    final_score numeric(5,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT analysis_results_clarity_of_speech_check CHECK (((clarity_of_speech >= (0)::numeric) AND (clarity_of_speech <= (100)::numeric))),
    CONSTRAINT analysis_results_content_relevance_check CHECK (((content_relevance >= (0)::numeric) AND (content_relevance <= (100)::numeric))),
    CONSTRAINT analysis_results_final_score_check CHECK (((final_score >= (0)::numeric) AND (final_score <= (100)::numeric))),
    CONSTRAINT analysis_results_fluency_check CHECK (((fluency >= (0)::numeric) AND (fluency <= (100)::numeric))),
    CONSTRAINT analysis_results_vocal_confidence_check CHECK (((vocal_confidence >= (0)::numeric) AND (vocal_confidence <= (100)::numeric)))
);


ALTER TABLE public.analysis_results OWNER TO postgres;

--
-- Name: analysis_results_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.analysis_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.analysis_results_id_seq OWNER TO postgres;

--
-- Name: analysis_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.analysis_results_id_seq OWNED BY public.analysis_results.id;


--
-- Name: candidate_list_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidate_list_items (
    id integer NOT NULL,
    job_session_id integer NOT NULL,
    list_order integer DEFAULT 0 NOT NULL,
    notes text,
    score numeric(5,2),
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(30) DEFAULT 'pending'::character varying,
    candidate_id integer NOT NULL
);


ALTER TABLE public.candidate_list_items OWNER TO postgres;

--
-- Name: candidate_list_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.candidate_list_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.candidate_list_items_id_seq OWNER TO postgres;

--
-- Name: candidate_list_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.candidate_list_items_id_seq OWNED BY public.candidate_list_items.id;


--
-- Name: candidates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidates (
    id integer CONSTRAINT candidats_id_not_null NOT NULL,
    first_name character varying,
    last_name character varying,
    cin character varying,
    email character varying,
    phone character varying,
    city character varying,
    infos character varying,
    owner_user_id integer
);


ALTER TABLE public.candidates OWNER TO postgres;

--
-- Name: candidats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.candidats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.candidats_id_seq OWNER TO postgres;

--
-- Name: candidats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.candidats_id_seq OWNED BY public.candidates.id;


--
-- Name: interviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interviews (
    id integer NOT NULL,
    job_session_id integer NOT NULL,
    candidate_item_id integer NOT NULL,
    audio_path text NOT NULL,
    status character varying(30) DEFAULT 'processing'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.interviews OWNER TO postgres;

--
-- Name: interviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.interviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.interviews_id_seq OWNER TO postgres;

--
-- Name: interviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.interviews_id_seq OWNED BY public.interviews.id;


--
-- Name: job_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_sessions (
    id integer NOT NULL,
    session_type character varying(50),
    owner_user_id integer NOT NULL,
    title character varying(255),
    job_title character varying(255),
    qualities text,
    scheduled_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.job_sessions OWNER TO postgres;

--
-- Name: job_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_sessions_id_seq OWNER TO postgres;

--
-- Name: job_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.job_sessions_id_seq OWNED BY public.job_sessions.id;


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id integer NOT NULL,
    audio_path character varying NOT NULL,
    status character varying,
    result json,
    created_at timestamp without time zone
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: speaker_segments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.speaker_segments (
    id integer NOT NULL,
    interview_id integer NOT NULL,
    speaker_label character varying(100),
    start_seconds numeric(10,3),
    end_seconds numeric(10,3),
    text text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_speaker_time CHECK (((end_seconds IS NULL) OR (start_seconds IS NULL) OR (end_seconds > start_seconds))),
    CONSTRAINT speaker_segments_end_seconds_check CHECK ((end_seconds >= (0)::numeric)),
    CONSTRAINT speaker_segments_start_seconds_check CHECK ((start_seconds >= (0)::numeric))
);


ALTER TABLE public.speaker_segments OWNER TO postgres;

--
-- Name: speaker_segments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.speaker_segments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.speaker_segments_id_seq OWNER TO postgres;

--
-- Name: speaker_segments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.speaker_segments_id_seq OWNED BY public.speaker_segments.id;


--
-- Name: training_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.training_sessions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    audio_path text,
    difficulty_level character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.training_sessions OWNER TO postgres;

--
-- Name: training_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.training_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.training_sessions_id_seq OWNER TO postgres;

--
-- Name: training_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.training_sessions_id_seq OWNED BY public.training_sessions.id;


--
-- Name: transcription_segments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transcription_segments (
    id integer NOT NULL,
    interview_id integer NOT NULL,
    start_seconds numeric(10,3),
    end_seconds numeric(10,3),
    transcript text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_end_seconds_gt_start CHECK ((end_seconds > start_seconds)),
    CONSTRAINT chk_start_seconds_positive CHECK ((start_seconds >= (0)::numeric))
);


ALTER TABLE public.transcription_segments OWNER TO postgres;

--
-- Name: transcription_segments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transcription_segments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transcription_segments_id_seq OWNER TO postgres;

--
-- Name: transcription_segments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transcription_segments_id_seq OWNED BY public.transcription_segments.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    first_name character varying(255) CONSTRAINT users_full_name_not_null NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    date_of_birth date,
    registered_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    role character varying(20) NOT NULL,
    bio text,
    is_active boolean DEFAULT true NOT NULL,
    last_name character varying(255) NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY (ARRAY[('candidate'::character varying)::text, ('recruiter'::character varying)::text, ('admin'::character varying)::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: analysis_results id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analysis_results ALTER COLUMN id SET DEFAULT nextval('public.analysis_results_id_seq'::regclass);


--
-- Name: candidate_list_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_list_items ALTER COLUMN id SET DEFAULT nextval('public.candidate_list_items_id_seq'::regclass);


--
-- Name: candidates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidates ALTER COLUMN id SET DEFAULT nextval('public.candidats_id_seq'::regclass);


--
-- Name: interviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews ALTER COLUMN id SET DEFAULT nextval('public.interviews_id_seq'::regclass);


--
-- Name: job_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_sessions ALTER COLUMN id SET DEFAULT nextval('public.job_sessions_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: speaker_segments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.speaker_segments ALTER COLUMN id SET DEFAULT nextval('public.speaker_segments_id_seq'::regclass);


--
-- Name: training_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.training_sessions ALTER COLUMN id SET DEFAULT nextval('public.training_sessions_id_seq'::regclass);


--
-- Name: transcription_segments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transcription_segments ALTER COLUMN id SET DEFAULT nextval('public.transcription_segments_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: analysis_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.analysis_results (id, interview_id, content_relevance, vocal_confidence, clarity_of_speech, fluency, feedback, final_score, created_at) FROM stdin;
3	2	0.00	90.00	95.00	90.00	The candidate's response was entirely irrelevant to the UX Designer role and its required qualities. The content suggests this transcript is not from a professional job interview. No relevant skills or experience were demonstrated.	55.00	2026-03-16 20:47:08.135034
6	1	0.00	0.00	0.00	0.00	Analysis failed due to an internal error.	0.00	2026-05-23 01:58:23.01461
7	4	95.00	90.00	90.00	90.00	The candidate effectively addressed all required qualities, particularly empathy, communication, and teamwork, with relevant examples. Her approach to creativity and user needs demonstrates a strong understanding of the UX role. She presented her answers clearly and confidently.	92.00	2026-05-23 20:33:08.271506
\.


--
-- Data for Name: candidate_list_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidate_list_items (id, job_session_id, list_order, notes, score, added_at, status, candidate_id) FROM stdin;
5	1	1		\N	2026-03-09 20:44:23.566748	shortlisted	5
6	1	2		\N	2026-03-09 20:44:58.099295	shortlisted	6
8	1	4		\N	2026-03-09 20:46:13.818878	shortlisted	8
9	1	4		\N	2026-03-09 20:47:08.538217	shortlisted	9
10	3	1		\N	2026-04-08 10:27:00.230604	shortlisted	10
11	1	5		\N	2026-05-23 00:16:24.166726	shortlisted	11
12	4	1		\N	2026-05-23 00:33:01.749964	shortlisted	11
\.


--
-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidates (id, first_name, last_name, cin, email, phone, city, infos, owner_user_id) FROM stdin;
1	Hamza	EL MANOUZI	26272	hamzaelma242@gmail.com	062119289	Casablanca		\N
2	Rida	EL ANTARI	65711	rdet@gmail.com	064535453	Beni Mellal		\N
3	Hamza	EL MANOUZI	54566	hamzaelma242@gmail.com	0645342434	Casablanca		\N
4	Rida	ELANTARI	45654	rdet@gmail.com	06434546	Beni mellal		\N
5	Hamza	EL MANOUZI	56546	hamzaelma242@gmail.com	063534554	Casablanca		\N
6	Rida	ELANTARI	65645	rdet@gmail.com	064453456	Beni Mellal		\N
7	Chadi	Blal	45545	chadipro@gmail.com	065433435	Khouribga		\N
8	Hassan	LOULID	54655	hassannerroo@gmail.com	06545345	Khouribga		\N
9	Chadi	BLAL	455455	chadipro@gmail.com	06454454	Khouribga		\N
10	Nada	Benassou	UY45677	benassounada4@gmail.com	0621577965	RABAT		\N
11	Sarah	BENALI	232124	sarah@gmail.com	069283844	Casablanca		\N
\.


--
-- Data for Name: interviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interviews (id, job_session_id, candidate_item_id, audio_path, status, created_at, updated_at) FROM stdin;
2	1	6	audios\\interview_2_1773694027.wav	completed	2026-03-16 20:47:06.451872	2026-03-16 20:47:08.135034
3	1	11	uploads/audio/interviews\\interview_3_1779491832.m4a	failed	2026-05-23 00:17:12.297008	2026-05-23 00:17:12.44203
1	1	5	uploads/audio/interviews\\interview_1_1779497899.wav	completed	2026-03-15 15:47:08.525443	2026-05-23 01:58:23.01461
4	4	12	uploads/audio/interviews\\interview_4_1779564785.wav	completed	2026-05-23 00:33:15.304072	2026-05-23 20:33:08.271506
\.


--
-- Data for Name: job_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_sessions (id, session_type, owner_user_id, title, job_title, qualities, scheduled_date, created_at, updated_at) FROM stdin;
1	recruiter	2	UX Designer	UX Designer	Leadership, Color Matching	2026-03-20	2026-03-09 20:39:19.135541	2026-03-09 20:39:19.135541
2	recruiter	2	Java Developper	Java Developper	Leadership, SpringBoot, FastAPI, OOP	2026-04-10	2026-04-08 10:03:02.145848	2026-04-08 10:03:02.145848
3	recruiter	2	Data analyst	Data analyst	Leadership, big data, Mapreduce, JEE, APIRest	2026-11-12	2026-04-08 10:25:27.12428	2026-04-08 10:25:27.12428
4	recruiter	2	UX Designer	UX Designer	Leadership, Créativité, Empathie, Communication, Esprit d'équipe, Curiosité	2026-05-24	2026-05-23 00:29:30.829864	2026-05-23 00:29:30.829864
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, audio_path, status, result, created_at) FROM stdin;
\.


--
-- Data for Name: speaker_segments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.speaker_segments (id, interview_id, speaker_label, start_seconds, end_seconds, text, created_at) FROM stdin;
\.


--
-- Data for Name: training_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.training_sessions (id, user_id, audio_path, difficulty_level, created_at) FROM stdin;
\.


--
-- Data for Name: transcription_segments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transcription_segments (id, interview_id, start_seconds, end_seconds, transcript, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, first_name, email, password_hash, date_of_birth, registered_at, role, bio, is_active, last_name) FROM stdin;
1	Hamza	hamza@test.com	testhash123	2000-01-01	2026-03-08 16:44:16.750127	candidate	test user	t	Test
3	Hamza	testtttttttt@gmail.com	$bcrypt-sha256$v=2,t=2b,r=12$VmYkOMxTLrc4gV5RN/V.ku$muKQSVQWnLwNTr8hScwGWEOaYM9vgNG	\N	2026-05-14 11:47:36.617561	candidate	\N	t	EL MANOUZI
2	Hamza	hamzaelma242@gmail.com	$bcrypt-sha256$v=2,t=2b,r=12$ovGRJbKPhHEoh5tpoGKARO$Q4xcA39QeBgFeyfaQ9k58paFLhadkhm	\N	2026-03-09 19:46:35.505977	recruiter	\N	t	EL MANOUZI
\.


--
-- Name: analysis_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.analysis_results_id_seq', 7, true);


--
-- Name: candidate_list_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.candidate_list_items_id_seq', 12, true);


--
-- Name: candidats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.candidats_id_seq', 11, true);


--
-- Name: interviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.interviews_id_seq', 4, true);


--
-- Name: job_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_sessions_id_seq', 4, true);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- Name: speaker_segments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.speaker_segments_id_seq', 361, true);


--
-- Name: training_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.training_sessions_id_seq', 1, false);


--
-- Name: transcription_segments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transcription_segments_id_seq', 361, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: analysis_results analysis_results_interview_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analysis_results
    ADD CONSTRAINT analysis_results_interview_id_key UNIQUE (interview_id);


--
-- Name: analysis_results analysis_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analysis_results
    ADD CONSTRAINT analysis_results_pkey PRIMARY KEY (id);


--
-- Name: candidate_list_items candidate_list_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_list_items
    ADD CONSTRAINT candidate_list_items_pkey PRIMARY KEY (id);


--
-- Name: interviews interviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_pkey PRIMARY KEY (id);


--
-- Name: job_sessions job_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_sessions
    ADD CONSTRAINT job_sessions_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: speaker_segments speaker_segments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.speaker_segments
    ADD CONSTRAINT speaker_segments_pkey PRIMARY KEY (id);


--
-- Name: training_sessions training_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.training_sessions
    ADD CONSTRAINT training_sessions_pkey PRIMARY KEY (id);


--
-- Name: transcription_segments transcription_segments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transcription_segments
    ADD CONSTRAINT transcription_segments_pkey PRIMARY KEY (id);


--
-- Name: interviews uq_interview_candidate_per_session; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT uq_interview_candidate_per_session UNIQUE (job_session_id, candidate_item_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_analysis_results_interview; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analysis_results_interview ON public.analysis_results USING btree (interview_id);


--
-- Name: idx_candidate_list_job_session; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_candidate_list_job_session ON public.candidate_list_items USING btree (job_session_id);


--
-- Name: idx_interviews_candidate_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_interviews_candidate_item ON public.interviews USING btree (candidate_item_id);


--
-- Name: idx_interviews_job_session; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_interviews_job_session ON public.interviews USING btree (job_session_id);


--
-- Name: idx_job_sessions_owner; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_sessions_owner ON public.job_sessions USING btree (owner_user_id);


--
-- Name: idx_speaker_segments_interview; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_speaker_segments_interview ON public.speaker_segments USING btree (interview_id);


--
-- Name: idx_training_sessions_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_training_sessions_user ON public.training_sessions USING btree (user_id);


--
-- Name: ix_jobs_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_jobs_id ON public.jobs USING btree (id);


--
-- Name: ix_transcription_segments_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_transcription_segments_id ON public.transcription_segments USING btree (id);


--
-- Name: analysis_results fk_analysis_results_interview; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analysis_results
    ADD CONSTRAINT fk_analysis_results_interview FOREIGN KEY (interview_id) REFERENCES public.interviews(id) ON DELETE CASCADE;


--
-- Name: candidate_list_items fk_candidate_list_job_session; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_list_items
    ADD CONSTRAINT fk_candidate_list_job_session FOREIGN KEY (job_session_id) REFERENCES public.job_sessions(id) ON DELETE CASCADE;


--
-- Name: interviews fk_interviews_candidate_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT fk_interviews_candidate_item FOREIGN KEY (candidate_item_id) REFERENCES public.candidate_list_items(id) ON DELETE CASCADE;


--
-- Name: interviews fk_interviews_job_session; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT fk_interviews_job_session FOREIGN KEY (job_session_id) REFERENCES public.job_sessions(id) ON DELETE CASCADE;


--
-- Name: job_sessions fk_job_sessions_owner; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_sessions
    ADD CONSTRAINT fk_job_sessions_owner FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: speaker_segments fk_speaker_segments_interview; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.speaker_segments
    ADD CONSTRAINT fk_speaker_segments_interview FOREIGN KEY (interview_id) REFERENCES public.interviews(id) ON DELETE CASCADE;


--
-- Name: training_sessions fk_training_sessions_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.training_sessions
    ADD CONSTRAINT fk_training_sessions_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: transcription_segments transcription_segments_interview_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transcription_segments
    ADD CONSTRAINT transcription_segments_interview_id_fkey FOREIGN KEY (interview_id) REFERENCES public.interviews(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict X6yhnbOPfnY0Fq0GnK3gJsrldCuxloFnHdOWEFd224bv7FjUg5ebdbHQsttN2wd


\connect bd_auth
--
-- PostgreSQL database dump
--

\restrict xFHoy5Ps7sdeaZz9UpR7JjYPlmTZkBH4oDC5VbtpLVRux2CK7fiJu3PfSRcPmb5

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: usuario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuario (
    id bigint NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    nombre character varying(255),
    rol character varying(255) DEFAULT 'ADMIN'::character varying NOT NULL,
    estado character varying(255) DEFAULT 'ACTIVO'::character varying NOT NULL,
    correo character varying(255)
);


--
-- Name: usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuario_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuario_id_seq OWNED BY public.usuario.id;


--
-- Name: usuario id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id SET DEFAULT nextval('public.usuario_id_seq'::regclass);


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuario (id, username, password, nombre, rol, estado, correo) FROM stdin;
2	edgaradrianmora	$2a$10$HQyNTYddOBUcl685ysm/IO34D7I0RCDbMszIWdieLbO9QrfsORmWy	Administrador Edgar Adrian	ADMIN	ACTIVO	\N
3	camilaroca	$2a$10$hLnaPZtb24ZEYNRXqbUGR.ETUCQzbJIMsFdjFqFNKBz/hxKaM5jqK	Camila Roca	CLIENTE	ACTIVO	\N
\.


--
-- Name: usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuario_id_seq', 3, true);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id);


--
-- Name: usuario usuario_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_username_key UNIQUE (username);


--
-- PostgreSQL database dump complete
--

\unrestrict xFHoy5Ps7sdeaZz9UpR7JjYPlmTZkBH4oDC5VbtpLVRux2CK7fiJu3PfSRcPmb5


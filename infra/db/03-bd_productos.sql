\connect bd_productos
--
-- PostgreSQL database dump
--

\restrict paGz9yLuWYqx4FFbEJCzGjNnyJIy2aijs8ehQYIT0nAvlCmDg3qTjEQDsyV3TSt

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
-- Name: producto; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.producto (
    id bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion character varying(255),
    precio double precision NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    categoria character varying(255),
    estado character varying(255) DEFAULT 'ACTIVO'::character varying NOT NULL,
    imagen_url text
);


--
-- Name: producto_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.producto_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: producto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.producto_id_seq OWNED BY public.producto.id;


--
-- Name: producto id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto ALTER COLUMN id SET DEFAULT nextval('public.producto_id_seq'::regclass);


--
-- Data for Name: producto; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.producto (id, nombre, descripcion, precio, stock, categoria, estado, imagen_url) FROM stdin;
2	Torta tres leches	Torta tres leches con relleno de fresa	65	0	Tortas	ACTIVO	\N
4	Torta helada	Torta helada clásica	30	0	Tortas	ACTIVO	\N
5	Torta de maracuyá	Torta helada de maracuyá	55	0	Tortas	ACTIVO	\N
7	Torta helada	dsadsadsa	22	0	Tortas	ACTIVO	
3	Torta selva negra	Torta de chocolate con fosh	65	0	Tortas	ACTIVO	
6	Torta Milhojas	Torta MilHojas con helado	50	0	Tortas	ACTIVO	\N
\.


--
-- Name: producto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.producto_id_seq', 7, true);


--
-- Name: producto producto_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT producto_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict paGz9yLuWYqx4FFbEJCzGjNnyJIy2aijs8ehQYIT0nAvlCmDg3qTjEQDsyV3TSt


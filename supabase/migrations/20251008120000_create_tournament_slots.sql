
CREATE TABLE public.tournament_slots (
    id bigint NOT NULL,
    match_id text NOT NULL,
    slot_number integer NOT NULL,
    player_ign text NOT NULL,
    team_members text[],
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid
);

ALTER TABLE public.tournament_slots OWNER TO postgres;

CREATE SEQUENCE public.tournament_slots_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.tournament_slots_id_seq OWNER TO postgres;

ALTER SEQUENCE public.tournament_slots_id_seq OWNED BY public.tournament_slots.id;

ALTER TABLE ONLY public.tournament_slots ALTER COLUMN id SET DEFAULT nextval('public.tournament_slots_id_seq'::regclass);

ALTER TABLE ONLY public.tournament_slots
    ADD CONSTRAINT tournament_slots_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.tournament_slots
    ADD CONSTRAINT tournament_slots_match_id_slot_number_key UNIQUE (match_id, slot_number);

ALTER TABLE ONLY public.tournament_slots
    ADD CONSTRAINT tournament_slots_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE public.tournament_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.tournament_slots FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.tournament_slots FOR INSERT TO authenticated WITH CHECK (true);

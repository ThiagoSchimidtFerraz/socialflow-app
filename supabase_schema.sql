-- ====================================
-- SOCIALFLOW — SCHEMA SEGURO (SaaS v3.0)
-- Execute no SQL Editor do Supabase
-- ====================================

-- 1. Tabela: empresas (Gestão Multi-Tenant)
CREATE TABLE IF NOT EXISTS empresas (
    id TEXT PRIMARY KEY DEFAULT 'emp_' || LOWER(HEX(RANDOMBYTES(8))),
    nome TEXT NOT NULL,
    plano TEXT DEFAULT 'basic' CHECK (plano IN ('basic', 'premium', 'enterprise')),
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    config_limite_usuarios INTEGER DEFAULT 5,
    config_limite_contas INTEGER DEFAULT 3,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    ultimo_faturamento TIMESTAMPTZ
);

-- 2. Tabela: users (Migrado para Auth do Supabase)
-- Nota: 'senha' removida daqui pois o Supabase Auth cuida do hashing nativamente
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    empresa_id TEXT REFERENCES empresas(id),
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('master', 'admin', 'social_media', 'designer', 'cliente')),
    avatar TEXT,
    status TEXT DEFAULT 'aprovado' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
    contas_ids TEXT[] DEFAULT '{}',
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela: contas (marcas/clientes da agência)
CREATE TABLE IF NOT EXISTS contas (
    id TEXT PRIMARY KEY,
    empresa_id TEXT REFERENCES empresas(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    cor TEXT DEFAULT '#4F46E5',
    codigo_convite TEXT UNIQUE,
    data_expiracao DATE,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela: cronogramas
CREATE TABLE IF NOT EXISTS cronogramas (
    id TEXT PRIMARY KEY,
    empresa_id TEXT REFERENCES empresas(id) ON DELETE CASCADE,
    conta_id TEXT REFERENCES contas(id) ON DELETE CASCADE,
    mes_referencia TEXT,
    titulo TEXT NOT NULL,
    briefing TEXT DEFAULT '',
    status TEXT DEFAULT 'rascunho',
    criado_por UUID REFERENCES users(id),
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    copys JSONB DEFAULT '[]'::jsonb,
    artes JSONB DEFAULT '[]'::jsonb,
    comentarios JSONB DEFAULT '[]'::jsonb,
    timeline JSONB DEFAULT '[]'::jsonb
);

-- 5. Tabela: master_audit_log (Logs Imutáveis)
CREATE TABLE IF NOT EXISTS master_audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action_type TEXT NOT NULL,
    target_type TEXT, -- 'empresa', 'user', 'conta'
    target_id TEXT,
    old_value JSONB,
    new_value JSONB,
    ip_address TEXT,
    user_agent TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_users_empresa ON users(empresa_id);
CREATE INDEX IF NOT EXISTS idx_contas_empresa ON contas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_cronogramas_empresa ON cronogramas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_audit_type ON master_audit_log(action_type);

-- ====================================
-- SEGURANÇA: ROW LEVEL SECURITY (RLS)
-- ====================================

ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cronogramas ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_audit_log ENABLE ROW LEVEL SECURITY;

-- POLICIES: empresas
CREATE POLICY "Master vê todas empresas" ON empresas FOR SELECT USING (auth.jwt() ->> 'role' = 'master');
CREATE POLICY "Admin vê sua empresa" ON empresas FOR SELECT USING (id = (SELECT empresa_id FROM users WHERE id = auth.uid()));

-- POLICIES: users
CREATE POLICY "Master vê todos usuários" ON users FOR SELECT USING (auth.jwt() ->> 'role' = 'master');
CREATE POLICY "Usuários veem colegas da mesma empresa" ON users FOR SELECT USING (empresa_id = (SELECT empresa_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Usuário edita seu próprio perfil" ON users FOR UPDATE USING (id = auth.uid());

-- POLICIES: contas e cronogramas (Filtro por Empresa)
CREATE POLICY "Isolamento por Empresa (Contas)" ON contas FOR ALL 
USING (empresa_id = (SELECT empresa_id FROM users WHERE id = auth.uid()) OR auth.jwt() ->> 'role' = 'master');

CREATE POLICY "Isolamento por Empresa (Cronogramas)" ON cronogramas FOR ALL 
USING (empresa_id = (SELECT empresa_id FROM users WHERE id = auth.uid()) OR auth.jwt() ->> 'role' = 'master');

-- POLICY: auditoria (Apenas Master)
CREATE POLICY "Apenas Master vê logs" ON master_audit_log FOR SELECT USING (auth.jwt() ->> 'role' = 'master');
CREATE POLICY "Log automático ao inserir" ON master_audit_log FOR INSERT WITH CHECK (true);


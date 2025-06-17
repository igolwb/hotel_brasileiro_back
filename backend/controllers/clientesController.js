import bcrypt from 'bcrypt';
import { sql } from "../config/db.js";

// Cria um novo cliente no banco de dados, realizando hash da senha e validando campos obrigatórios
export const criarCliente = async (req, res) => {
  const { nome, email, telefone, senha } = req.body;

  if (!nome || !email || !telefone || !senha) {
    console.warn('[POST /clientes] Campos obrigatórios não preenchidos:', req.body);
    return res.status(400).json({ success: false, message: 'Preencha todos os campos!' });
  }

  try {
    // Hash da senha antes de salvar
    const senhaHash = await bcrypt.hash(senha, 10);

    const novoCliente = await sql`
      INSERT INTO clientes (nome, email, telefone, senha)
      VALUES (${nome}, ${email}, ${telefone}, ${senhaHash})
      RETURNING id, nome, email, telefone;
    `;

    console.log('[POST /clientes] Novo cliente criado:', novoCliente[0]);
    res.status(201).json({ success: true, data: novoCliente[0] });

  } catch (error) {
    console.error('[POST /clientes] Erro na função criarCliente:', error);

    // Código de erro para violação de unicidade no PostgreSQL
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Email já cadastrado.'
      });
    }

    res.status(500).json({ success: false, message: 'Erro interno no servidor' });
  }
};

// Busca todos os clientes cadastrados, ordenados por id decrescente
export const buscarClientes = async(req, res) => {
    try {
        const clientes = await sql `
        SELECT * FROM clientes
        ORDER BY id DESC
        `;

        console.log('[GET /clientes] Clientes encontrados:', clientes);
        res.status(200).json({success: true , data: clientes});

    } catch (error) {
        console.error('[GET /clientes] Erro na função buscarClientes:', error);
        res.status(500).json({ success: false, message: 'Erro interno no servidor' });
    }
};

// Busca um cliente específico pelo id fornecido na URL
export const buscarClienteId = async(req, res) => {
    const { id } = req.params;

    try {
        const cliente = await sql `
        SELECT * FROM clientes WHERE id =${id}
        `
        console.log(`[GET /clientes/${id}] Cliente encontrado:`, cliente[0]);
        res.status(200).json({ success: true, data: cliente[0] });
    } catch (error) {
        console.error(`[GET /clientes/${id}] Erro na função buscarClienteId:`, error);
        res.status(500).json({ success: false, message: 'Erro interno no servidor' });
    }
};

// Atualiza os dados de um cliente pelo id, incluindo hash da nova senha se enviada
export const atualizarCliente = async(req, res) => {
    const { id } = req.params;
    const { nome , email, telefone, senha } = req.body;

    try {
        let senhaAtualizada = senha;
        if (senha) {
            // Criptografa a senha se ela foi enviada
            senhaAtualizada = await bcrypt.hash(senha, 10);
        }
        const clienteAtualizado = await sql `
        UPDATE  clientes SET nome = ${nome}, email = ${email}, telefone = ${telefone}, senha = ${senhaAtualizada}
        WHERE id = ${id} 
        RETURNING *
        `

        if(clienteAtualizado.length === 0){
            console.warn(`[PUT /clientes/${id}] Cliente não encontrado para atualização.`);
            return res.status(404).json({success: false, message: 'Cliente não encontrado'})
        }

        console.log(`[PUT /clientes/${id}] Cliente atualizado:`, clienteAtualizado[0]);
        res.status(200).json({ success: true, data: clienteAtualizado[0] });
        
    } catch (error) {
        console.error(`[PUT /clientes/${id}] Erro na função atualizarCliente:`, error);
        res.status(500).json({ success: false, message: 'Erro interno no servidor' });
    }
};

// Deleta um cliente do banco de dados pelo id fornecido
export const deletarCliente = async(req, res) => {
    const { id } = req.params;

    try {
        const clienteDeletado = await sql `
        DELETE FROM clientes WHERE id = ${id}
        RETURNING *;
        `

        if(clienteDeletado.length === 0){
            console.warn(`[DELETE /clientes/${id}] Cliente não encontrado para exclusão.`);
            return res.status(404).json({success: false, message: 'cliente não encontrado'})
        }

        console.log(`[DELETE /clientes/${id}] Cliente deletado:`, clienteDeletado[0]);
        res.status(200).json({ 
            success: true, 
            data: clienteDeletado[0] 
        });
        
    } catch (error) {
        console.error(`[DELETE /clientes/${id}] Erro na função deletarCliente:`, error);
        res.status(500).json({ success: false, message: 'Erro interno no servidor' });
        
    }

};

// Busca os dados do cliente autenticado (usando o id do token), sem retornar a senha
export const buscarClienteMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const cliente = await sql`
      SELECT id, nome, email, telefone FROM clientes WHERE id = ${userId}
    `;
    if (!cliente[0]) {
      return res.status(404).json({ success: false, message: 'Cliente não encontrado' });
    }
    res.status(200).json({ success: true, data: cliente[0] });
  } catch (error) {
    console.error('[GET /clientes/me] Erro:', error);
    res.status(500).json({ success: false, message: 'Erro interno no servidor' });
  }
};
function Processo (ID, aDuracao, aChegada, aPrioridade, aCor)
{
    this.ID;
    this.duracao;
    this.chegada;
    this.prioridade;
    this.cor;
    
    this.tempoEspera;
    this.tempoExecucao;
    this.tempoResposta;
    
    
    this.construtor = function()
    {
        this.ID = ID;
        this.duracao = aDuracao;
        this.chegada = aChegada;
        this.prioridade = aPrioridade;
        this.cor = aCor;
        this.tempoEspera = 0;
        this.tempoExecucao = 0;
        this.tempoResposta = 0;
    };
    
    
    
    /*
        incrementa o tempo de espera do processo
    */
    this.incrementaTEspera = function ()
    {
        this.tempoEspera += 1;
    };
    
    
    
    /*
        incrementa o tempo de execução do processo
        retorna true se o processo terminar
    */
    this.incrementaTExecucao = function ()
    {
        if (this.tempoExecucao == 0)
            this.tempoResposta = this.tempoEspera;
            
        this.tempoExecucao += 1;
        
        if (this.tempoExecucao >= this.duracao)
            return true;
            
        return false;
    };
    
    
    
    this.construtor();
}
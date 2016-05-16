function EscalonadorSJF ()
{
    this.filaProcessos;
    
    
    
    this.construtor = function ()
    {
        this.filaProcessos = [];
    };
    
    
    
    this.empty = function ()
    {
        if (this.filaProcessos.length == 0)
            return true;
        else
            return false;
    };
    
    
    
    this.addProcesso = function (p)
    {
        this.filaProcessos.splice(0, 0, p);
        this.filaProcessos.sort ( function (a, b)
        {
            return a.duracao < b.duracao;
        });
    };
    
    
    
    this.pickProcesso = function ()
    {
        return this.filaProcessos.pop();
    };
    
    
    
    this.addEspera = function()
    {
        for (i in this.filaProcessos)
            this.filaProcessos[i].incrementaTEspera();
    };
    
    
    
    this.construtor();
}
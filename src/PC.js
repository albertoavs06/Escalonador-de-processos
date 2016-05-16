function PC (aProcessos)
{
    this.filaProcessos;
    this.processosTerminados;
    
    this.construtor = function ()
    {
        this.filaProcessos = aProcessos;
        this.processosTerminados = [];
        
        this.filaProcessos.sort( function (a, b)
        {
            return a.chegada <= b.chegada;
        });

    };
    
    
    
    this.empty = function ()
    {
        if (this.filaProcessos.length == 0)
            return true;
        else
            return false;
    }
    
    
    
    this.obterProcessosPorTempo = function (time)
    {
        var n = this.filaProcessos.length;
        var retorno = [];
    
        for (var i=n-1; i>=0 && this.filaProcessos[i].chegada <= time; i--)
            retorno.push(this.filaProcessos.pop());

        return retorno;
    }
    
    
    
    this.addTerminado = function (p)
    {
        this.processosTerminados.push(p);
    }
    
    
    
    this.tabelaTempos = function ()
    {
        var resultado = [];
        var aux;
        var espMed, respMed, turnMed;
        
        espMed = respMed = turnMed = 0;
        
        this.processosTerminados.sort ( function (a, b)
        {
            return a.ID > b.ID;
        });

        for (i in this.processosTerminados)
        {
            aux = this.processosTerminados[i];
            espMed += aux.tempoEspera;
            respMed += aux.tempoResposta;
            turnMed += aux.tempoEspera + aux.duracao - aux.chegada;
            resultado.push([aux.tempoEspera, aux.tempoResposta, aux.tempoEspera + aux.duracao]);
        }
        espMed /= this.processosTerminados.length;
        respMed /= this.processosTerminados.length;
        turnMed /= this.processosTerminados.length;
        resultado.push([espMed, respMed, turnMed]);
        
        return resultado;
    }
    
    
    
    this.reiniciar = function ()
    {
        this.filaProcessos = [];
        
        while (this.processosTerminados.length != 0)
        {
            this.processosTerminados[0].tempoEspera = 0;
            this.processosTerminados[0].tempoExecucao = 0;
            this.processosTerminados[0].tempoResposta = 0;
            this.filaProcessos.push(this.processosTerminados.shift());
        }
        
        this.filaProcessos.sort( function (a, b)
        {
            return a.ID > b.ID;
        });
        
        this.filaProcessos.sort( function (a, b)
        {
            return a.chegada <= b.chegada;
        });
    }
    
    
    
    this.construtor();
}
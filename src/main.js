var aba0;
var clock, pc, cpu;


$(document).ready( function () 
{
    $("#abas").tabs();
    
    aba0 = new Configuracoes();
    
    document.getElementById('nProcessos').addEventListener('change', quantidadeProcessos, true);
});

function quantidadeProcessos ()
{
    var n = eval(document.getElementById('nProcessos').value);
    
    aba0.ativarTelaProcessos(n);
    $("#abas").tabs('select', 1);
    $("#abas").tabs('select', 0);
}



function simula ()
{
    var aux = aba0.submeterDados();
    var metodos = document.getElementsByName("metodo");
    var resultados = [];
    var resultados2 = [];
    
    if (aux.length > 20)
    {
        $("#erros").html(aux);
        return;
    }    

    $("#aba1").html("<div id='resultadoTabela'></div><br><br><div id='resultadoGrafico'></div>");
    
    pc = new PC (aux);
    cpu = new CPU ();
    
    if (metodos[0].checked)
    {
        resultados[0] = simulaFCFS();
        resultados2[0] = pc.tabelaTempos();
        pc.reiniciar();
    }
    
    if (metodos[1].checked)
    {
        resultados[1] = simulaSJF();
        resultados2[1] = pc.tabelaTempos();
        pc.reiniciar();
    }
    
    if (metodos[2].checked)
    {
        resultados[2] = simulaFPP();
        resultados2[2] = pc.tabelaTempos();
        pc.reiniciar();
    }
    
    if (metodos[3].checked)
    {
        if (parseInt(document.getElementById("trocaContexto").value) != 0)
        {
            resultados[3] = simulaRR();
        }
        else
        {
            resultados[3] = simulaRR0();
        }
        resultados2[3] = pc.tabelaTempos();
    }
    
    $("#resultadoTabela").html(imprimirTabela(resultados2) + imprimirTabela2(resultados));
    //imprimirTabela (resultados2);
    imprimirResultados (resultados);
    
    $("#abas").tabs('select', 1);
}



function simulaFCFS ()
{
    var escalonador = new EscalonadorFCFS ();
    var resultado = [];
    var aux;

    clock = 0;
    while (!pc.empty() || !escalonador.empty() || cpu.ocupado)
    {
        aux = pc.obterProcessosPorTempo(clock);
        
        while (aux.length > 0)
            escalonador.addProcesso( aux.shift() );
        
        if (!cpu.ocupado && !escalonador.empty())
            cpu.addProcesso (escalonador.pickProcesso());
            
        if (cpu.ocupado)
        {
            aux = cpu.act();
            if (!cpu.ocupado)
                pc.addTerminado(aux);
        }
        else
            aux = null
        
        escalonador.addEspera(1);
        
        if (aux != null)
            resultado.push(aux.cor + ":" + aux.ID);
        else
            resultado.push("#ffffff:");
        
        //alert ("clock: " + clock + " - " + pc.empty() + ", " + escalonador.empty() + ", " + !cpu.ocupado);
        
        clock++;
    }
    //alert("terminou em " + clock + "ciclos.");
    
    return resultado;
}



function simulaSJF ()
{
    var escalonador = new EscalonadorSJF ();
    var resultado = [];
    var aux;

    clock = 0;
    while (!pc.empty() || !escalonador.empty() || cpu.ocupado)
    {
        aux = pc.obterProcessosPorTempo(clock);
        
        while (aux.length > 0)
            escalonador.addProcesso( aux.shift() );
        
        if (!cpu.ocupado && !escalonador.empty())
            cpu.addProcesso (escalonador.pickProcesso());
            
        if (cpu.ocupado)
        {
            aux = cpu.act();
            if (!cpu.ocupado)
                pc.addTerminado(aux);
        }
        else
            aux = null
        
        escalonador.addEspera();
        
        if (aux != null)
            resultado.push(aux.cor + ":" + aux.ID);
        else
            resultado.push("#ffffff:");
        
        //alert ("clock: " + clock + " - " + pc.empty() + ", " + escalonador.empty() + ", " + !cpu.ocupado);
        
        clock++;
    }
    //alert("terminou em " + clock + "ciclos.");
    
    return resultado;
}



function simulaFPP ()
{
    var escalonador = new EscalonadorPrioridade ();
    var trocaContexto = parseInt(document.getElementById("trocaContexto").value);
    var resultado = [];
    var chaveamento;
    var aux;
    
    clock = 0;
    chaveamento = 0;
    while (!pc.empty() || !escalonador.empty() || cpu.ocupado)
    {
        aux = pc.obterProcessosPorTempo(clock);
        while (aux.length > 0)
            escalonador.addProcesso( aux.shift() );
    
        if (chaveamento > 0)
        {
            resultado.push("#ffffff:");
            escalonador.addEspera(1);
            clock++;
            chaveamento--;
            continue;
        }

        if (!escalonador.empty())
        {
            if (!cpu.ocupado)
            {
                cpu.addProcesso (escalonador.pickProcesso());
            }
            else if (escalonador.top().prioridade < cpu.processo.prioridade)
            {
                aux = cpu.preempitaProcesso();
                escalonador.addProcesso(aux);
                chaveamento = trocaContexto;
                continue;
            }
        }
        
        if (cpu.ocupado)
        {
            aux = cpu.act();
            if (!cpu.ocupado)
            {
                pc.addTerminado(aux);
                chaveamento = trocaContexto;
            }
        }
        else
            aux = null
        
        escalonador.addEspera(1);
        
        if (aux != null)
            resultado.push(aux.cor + ":" + aux.ID);
        else
            resultado.push("#ffffff:");
        
        clock++;
        //alert (clock);
    }
    //alert("terminou em " + clock + "ciclos.");
    return resultado;
}



function simulaRR ()
{
    var escalonador = new EscalonadorFCFS ();
    var trocaContexto = parseInt(document.getElementById("trocaContexto").value);
    var quantun = parseInt(document.getElementById("quantun").value);
    var resultado = [];
    var aux, temp;
    var chaveamento;
    
    clock = 0;
    temp = 0;
    chaveamento = 0;
    while (!pc.empty() || !escalonador.empty() || cpu.ocupado)
    {   
        aux = pc.obterProcessosPorTempo(clock);
        while (aux.length > 0)
            escalonador.addProcesso( aux.shift() );

        if (chaveamento > 0)
        {
            resultado.push("#ffffff:");
            escalonador.addEspera(1);
            clock++;
            chaveamento--;
            continue;
        }

        if (temp == 0 && !escalonador.empty())
            cpu.addProcesso(escalonador.pickProcesso());
        

        if (cpu.ocupado)
        {
            temp++;
            aux = cpu.act();
            if (!cpu.ocupado)
            {
                pc.addTerminado(aux);
                temp = 0;
                chaveamento = trocaContexto;
            }
        }
        else
            aux = null;
            
        escalonador.addEspera(1);
        
        if (aux != null)
            resultado.push(aux.cor + ":" + aux.ID);
        else
            resultado.push("#ffffff:");
        
        clock++;
        
        if (temp == quantun)
        {
            temp = 0;
            chaveamento = trocaContexto;
            aux = cpu.preempitaProcesso();
            escalonador.addProcesso(aux);
        }
    }
    //alert("terminou em " + clock + "ciclos.");
    
    return resultado;
}
function simulaRR0 ()
{
    var escalonador = new EscalonadorFCFS ();
    var trocaContexto = parseInt(document.getElementById("trocaContexto").value);
    var quantun = parseInt(document.getElementById("quantun").value);
    var resultado = [];
    var aux, temp;
    var chaveamento;
    
    clock = 0;
    temp = 0;
    chaveamento = 0;
    while (!pc.empty() || !escalonador.empty() || cpu.ocupado)
    {   
        aux = pc.obterProcessosPorTempo(clock);
        while (aux.length > 0)
            escalonador.addProcesso( aux.shift() );

        if (chaveamento > 0)
        {
            aux = cpu.preempitaProcesso();
            escalonador.addProcesso(aux);
            chaveamento = 0;
        }

        if (temp == 0 && !escalonador.empty())
            cpu.addProcesso(escalonador.pickProcesso());

        if (cpu.ocupado)
        {
            temp++;
            aux = cpu.act();
            if (!cpu.ocupado)
            {
                pc.addTerminado(aux);
                temp = 0;
            }
        }
        else
            aux = null;
            
        escalonador.addEspera(1);
        
        if (aux != null)
            resultado.push(aux.cor + ":" + aux.ID);
        else
            resultado.push("#ffffff:");
        
        clock++;
        
        if (temp == quantun)
        {
            temp = 0;
            chaveamento = 1;
        }
    }
    //alert("terminou em " + clock + "ciclos.");
    
    return resultado;
}



function imprimirTabela (resultado)
{
    var aux, fundo;
    var tabela = "<center><table>";
    var n;
    
    tabela += "<tr>";
    tabela += "<td rowspan='2'>Processo</td>";
    
    n=0;
    for (i in resultado)
    {
        n++;
        switch (i)
        {
            case '0': tabela += "<td colspan='3'>FCFS</td>";
                    break;
            
            case '1': tabela += "<td colspan='3'>SJF</td>";
                    break;
            
            case '2': tabela += "<td colspan='3'>FPP</td>";
                    break;
                    
            case '3': tabela += "<td colspan='3'>RR</td>";
                    break;
                    
            default: tabela += "<td colspan='3'>1</td>";
        }
        
        
    }
    tabela += "</tr>";
    
    tabela += "<tr>";
    for (var i=0; i < n; i++)
        tabela += "<td>Tempo de Espera</td><td>Tempo de Resposta</td><td>Turn Around</td>";
    tabela += "</tr>";
    
    n = parseInt(document.getElementById("nProcessos").value) + 1;
    for (var i=0; i<n-1; i++)
    {
        tabela += "<tr>";
        aux = i+1;
        tabela += "<td>" + aux + "</td>";
        for (j in resultado)
        {
            aux = resultado[j][i];
            tabela += "<td>" + aux[0] + "</td><td>" + aux[1] + "</td><td>" + aux[2] + "</td>";
        }
        tabela += "</tr>";
    }
    
    tabela += "<tr><th>Médio</th>";
    for (j in resultado)
    {
        aux = resultado[j][n-1];
        tabela += "<th>" + aux[0].toFixed(2) + "</th><th>" + aux[1].toFixed(2) + "</th><th>" + aux[2].toFixed(2) + "</th>";
    }
    tabela += "</tr>";
    tabela += "</table></center>";
    
    //$("#resultadoTabela").html(tabela);
    return tabela;
}



function imprimirTabela2 (resultado)
{
    var tabela = "<br><center><table>";
    var ocio, exec, temp, temp2;
    var n, aux;
    
    tabela += "<tr>";
    tabela += "<td>Método</td><td>Produtividade</td><td>Ociosidade</td>";
    tabela += "</tr>";    
    
    for (i in resultado)
    {
        tabela += "<tr>";
        switch (i)
        {
            case '0': tabela += "<td>FCFS</td>";
                    break;
            
            case '1': tabela += "<td>SJF</td>";
                    break;
            
            case '2': tabela += "<td>FPP</td>";
                    break;
                    
            case '3': tabela += "<td>RR</td>";
                    break;
                    
            default: tabela += "<td>FCFS</td>";
        }
        
        
        ocio = exec = temp = 0;
        for (j in resultado[i])
        {
            aux = resultado[i][j].split(':');
            if (aux[1] == "")
                temp++;
            else
            {
                ocio += temp;
                temp = 0;
                exec++;
            }
        }
        aux = ocio + exec;
        temp = ocio/aux;
        temp2 = parseInt(document.getElementById("nProcessos").value) / aux;
        
        temp *= 100;
        temp2 *= 100;
        tabela += "<td>" + temp2.toFixed(2) + " %</td><td>" + temp.toFixed(2) +" %</td>"
        tabela += "</tr>";
    }
    tabela += "</table></center>"
    
    return tabela;
}



function imprimirResultados (resultado)
{
    var aux, n, maior;
    var i;
    var grafico;
    
    maior=0;
    for (i in resultado)
        maior = maior > resultado[i].length ? maior : resultado[i].length;
        
    
    grafico = "<center><table> <tr>";
    grafico += "<th>00000000</th>";
    for (var i=0; i<maior; i++)
        grafico += "<th>0000</th>";
    grafico += "</tr><tr>";

    grafico += "<td>Clock</td>";
    for (var i=0; i<maior; i++)
        grafico += "<td>" + i + "</td>";
        
    grafico += "</tr>";
    
    for (indice in resultado)
    {
        grafico += "<tr>";
        
        switch (indice)
        {
            case '0':   grafico += "<td>FC-FS</td>";
                        break;
            case '1':   grafico += "<td>SJF</td>";
                        break;
            case '2':   grafico += "<td>FPP</td>";
                        break;
            case '3':   grafico += "<td>RR</td>";
                        break;
            default:    grafico += "<td>FC-FS</td>";
        }
        
        for (i=0; i<resultado[indice].length; i++)
        {
            aux = resultado[indice][i].split(':');
            grafico += "<td style='background: " + aux[0] + "'>" + aux[1] + "</td>";
        }
        while (i < maior)
        {
            grafico += "<td style='background:'#ffffff'></td>";
            i++;
        }
        grafico += "</tr>";
    }
    
    grafico += "</table></center>";
    
    $("#resultadoGrafico").html(grafico);
}

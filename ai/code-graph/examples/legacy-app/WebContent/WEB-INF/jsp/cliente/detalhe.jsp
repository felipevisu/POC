<%@ taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@ include file="/WEB-INF/jsp/cabecalho.jspf" %>
<h1>Cliente <bean:write name="clienteForm" property="nome"/></h1>
<p>Saldo: <bean:write name="saldoFormatado"/></p>
<p>Dólar hoje: ${cotacao.valor}</p>
<logic:iterate id="c" name="contas">
  <bean:write name="c" property="numero"/>
</logic:iterate>

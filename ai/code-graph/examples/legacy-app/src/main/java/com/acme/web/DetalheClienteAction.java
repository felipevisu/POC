package com.acme.web;

import com.acme.service.ClienteService;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;
import javax.servlet.http.*;
import org.apache.struts.action.*;

public class DetalheClienteAction extends Action {
    private final ClienteService service = new ClienteService();

    public ActionForward execute(ActionMapping mapping, ActionForm form,
                                 HttpServletRequest request, HttpServletResponse response) throws Exception {
        ClienteForm f = (ClienteForm) form;
        f.setNome(service.buscarNome(f.getId()));
        BigDecimal saldo = service.saldoDisponivel(f.getId());
        String saldoFormatado = NumberFormat.getCurrencyInstance(new Locale("pt", "BR")).format(saldo);
        request.setAttribute("saldoFormatado", saldoFormatado);
        request.setAttribute("cotacao", service.cotacaoDolar());
        return mapping.findForward("sucesso");
    }
}

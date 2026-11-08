/* Gera o código Pix "copia e cola" (BR Code / EMV) com valor e identificador da reserva. */
(function () {
  function semAcento(s) {
    return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9 .\-]/g, "").toUpperCase();
  }
  function campo(id, valor) {
    var v = String(valor);
    return id + String(v.length).padStart(2, "0") + v;
  }
  function crc16(str) {
    var crc = 0xffff;
    for (var i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (var j = 0; j < 8; j++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  }
  window.gerarPix = function (opt) {
    var chave = String(opt.chave || "").trim();
    if (!chave) return "";
    var txid = semAcento(opt.txid || "***").replace(/[^A-Z0-9]/g, "").slice(0, 25) || "***";
    var conta = campo("00", "br.gov.bcb.pix") + campo("01", chave) + (opt.descricao ? campo("02", semAcento(opt.descricao).slice(0, 40)) : "");
    var payload =
      campo("00", "01") +
      campo("26", conta) +
      campo("52", "0000") +
      campo("53", "986") +
      (opt.valor ? campo("54", Number(opt.valor).toFixed(2)) : "") +
      campo("58", "BR") +
      campo("59", semAcento(opt.nome || "RECEBEDOR").slice(0, 25)) +
      campo("60", semAcento(opt.cidade || "SAO PAULO").slice(0, 15)) +
      campo("62", campo("05", txid)) +
      "6304";
    return payload + crc16(payload);
  };
})();

#
# Zend
#

$(builddir)/zend_language_scanner.lo: $(srcdir)/zend_language_parser.h
$(builddir)/zend_ini_scanner.lo: $(srcdir)/zend_ini_parser.h

$(srcdir)/zend_language_scanner.c: $(srcdir)/zend_language_scanner.re
	@(cd $(top_srcdir); $(RE2C) $(RE2C_FLAGS) --no-generation-date --case-inverted -cbdFt Zend/zend_language_scanner_defs.h -oZend/zend_language_scanner.c Zend/zend_language_scanner.re)

$(srcdir)/zend_language_parser.h: $(srcdir)/zend_language_parser.c
$(srcdir)/zend_language_parser.c: $(srcdir)/zend_language_parser.y
# Tweak zendparse to be exported through ZEND_API. This has to be revisited once
# bison supports foreign skeletons and that bison version is used. Read
# https://git.savannah.gnu.org/cgit/bison.git/tree/data/README.md for more.
	@$(YACC) -p zend -v -d $(srcdir)/zend_language_parser.y -o $@
	@$(SED) -e 's,^int zendparse\(.*\),ZEND_API int zendparse\1,g' < $@ \
	> $@.tmp && \
	mv $@.tmp $@
	@$(SED) -e 's,^int zendparse\(.*\),ZEND_API int zendparse\1,g' < $(srcdir)/zend_language_parser.h \
	> $(srcdir)/zend_language_parser.h.tmp && \
	mv $(srcdir)/zend_language_parser.h.tmp $(srcdir)/zend_language_parser.h
	@$(SED) -e 's,^#ifndef YYTOKENTYPE,#include "zend.h"\
#ifndef YYTOKENTYPE,g' < $(srcdir)/zend_language_parser.h \
	> $(srcdir)/zend_language_parser.h.tmp && \
	mv $(srcdir)/zend_language_parser.h.tmp $(srcdir)/zend_language_parser.h

$(srcdir)/zend_ini_parser.h: $(srcdir)/zend_ini_parser.c
$(srcdir)/zend_ini_parser.c: $(srcdir)/zend_ini_parser.y
	@$(YACC) -p ini_ -v -d $(srcdir)/zend_ini_parser.y -o $@

$(srcdir)/zend_ini_scanner.c: $(srcdir)/zend_ini_scanner.re
	@(cd $(top_srcdir); $(RE2C) $(RE2C_FLAGS) --no-generation-date --case-inverted -cbdFt Zend/zend_ini_scanner_defs.h -oZend/zend_ini_scanner.c Zend/zend_ini_scanner.re)

$(builddir)/zend_highlight.lo $(builddir)/zend_compile.lo: $(srcdir)/zend_language_parser.h

Zend/zend_execute.lo: $(srcdir)/zend_vm_execute.h $(srcdir)/zend_vm_opcodes.h

import json
import re
import time

from prometheus_client import Counter, Histogram, Gauge


GRAPHQL_REQUESTS_TOTAL = Counter(
    'graphql_requests_total',
    'Total GraphQL requests',
    ['operation_type', 'operation_name'],
)

GRAPHQL_ERRORS_TOTAL = Counter(
    'graphql_errors_total',
    'Total GraphQL errors',
    ['operation_type', 'operation_name'],
)

GRAPHQL_REQUEST_DURATION = Histogram(
    'graphql_request_duration_seconds',
    'GraphQL request duration in seconds',
    ['operation_type', 'operation_name'],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0],
)

GRAPHQL_IN_PROGRESS = Gauge(
    'graphql_requests_in_progress',
    'GraphQL requests currently being processed',
)

# All known root fields from the schema
QUERY_FIELDS = {'allStores', 'store', 'allSalesmen', 'salesman', 'allProducts', 'product', 'allSales', 'sale'}
MUTATION_FIELDS = {
    'createStore', 'updateStore', 'deleteStore',
    'createSalesman', 'updateSalesman', 'deleteSalesman',
    'createProduct', 'updateProduct', 'deleteProduct',
    'createSale', 'updateSale', 'deleteSale',
}

# Pattern to find root-level field names after the opening brace of the operation body
ROOT_FIELD_PATTERN = re.compile(r'(?:^|[\s,{])([a-zA-Z_]\w*)\s*[\({:]?', re.MULTILINE)


def _extract_root_fields(query, is_mutation):
    """Extract all root-level field names called in the query."""
    known = MUTATION_FIELDS if is_mutation else QUERY_FIELDS

    # Strip the outer operation wrapper: mutation { ... } or { ... }
    # Find the first '{' and take everything inside
    brace_depth = 0
    start = None
    for i, ch in enumerate(query):
        if ch == '{':
            if brace_depth == 0:
                start = i + 1
            brace_depth += 1
        elif ch == '}':
            brace_depth -= 1

    if start is None:
        return []

    # Get the content at the root level (depth 1)
    inner = query[start:]
    depth = 0
    root_content = []
    for ch in inner:
        if ch == '{':
            depth += 1
        elif ch == '}':
            if depth == 0:
                break
            depth -= 1
        if depth == 0:
            root_content.append(ch)

    root_text = ''.join(root_content)
    matches = ROOT_FIELD_PATTERN.findall(root_text)
    fields = [m for m in matches if m in known]
    return fields if fields else []


def _parse_operations(body):
    """Extract list of (operation_type, operation_name) from a GraphQL request body."""
    try:
        data = json.loads(body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return [('unknown', 'unknown')]

    query = data.get('query', '')
    if not query:
        return [('unknown', 'unknown')]

    # Introspection
    if '__schema' in query or '__type' in query:
        return [('query', 'introspection')]

    stripped = query.strip()
    is_mutation = stripped.startswith('mutation')
    op_type = 'mutation' if is_mutation else 'query'

    fields = _extract_root_fields(query, is_mutation)
    if fields:
        return [(op_type, f) for f in fields]

    # Fallback: use operationName or 'anonymous'
    op_name = data.get('operationName') or 'anonymous'
    return [(op_type, op_name)]


class GraphQLMetricsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path != '/graphql/' or request.method != 'POST':
            return self.get_response(request)

        operations = _parse_operations(request.body)

        for op_type, op_name in operations:
            GRAPHQL_REQUESTS_TOTAL.labels(
                operation_type=op_type, operation_name=op_name,
            ).inc()

        GRAPHQL_IN_PROGRESS.inc()
        start = time.perf_counter()
        response = self.get_response(request)
        duration = time.perf_counter() - start
        GRAPHQL_IN_PROGRESS.dec()

        for op_type, op_name in operations:
            GRAPHQL_REQUEST_DURATION.labels(
                operation_type=op_type, operation_name=op_name,
            ).observe(duration)

        # Check for GraphQL errors
        try:
            resp_body = json.loads(response.content)
            if resp_body.get('errors'):
                for op_type, op_name in operations:
                    GRAPHQL_ERRORS_TOTAL.labels(
                        operation_type=op_type, operation_name=op_name,
                    ).inc()
        except (json.JSONDecodeError, UnicodeDecodeError):
            pass

        return response
